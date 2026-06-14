# Oracle Cloud 무료 A1 인스턴스 한도 축소 확인과 조치 방법

Oracle Cloud Infrastructure, OCI의 Always Free Ampere A1 인스턴스 한도가 축소된 것으로 확인된다.

기존에는 무료 A1 인스턴스를 다음 수준으로 사용하는 경우가 많았다.

```text
VM.Standard.A1.Flex
4 OCPU
24GB Memory
```

하지만 현재 Oracle 공식 Always Free 문서 기준으로는 A1 무료 한도가 다음과 같이 표시된다.

```text
1,500 OCPU hours / month
9,000 GB hours / month
```

이는 24시간 상시 구동 기준으로 다음 구성에 해당한다.

```text
2 OCPU
12GB Memory
```

Oracle 문서도 Always Free tenancy 기준으로 `2 OCPUs and 12 GB of memory`에 해당한다고 설명한다. ([docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))

## 기존 구성과 현재 기준 비교

|항목|기존에 많이 쓰던 구성|현재 문서 기준 안전 구성|
|---|--:|--:|
|Shape|VM.Standard.A1.Flex|VM.Standard.A1.Flex|
|OCPU|4|2|
|Memory|24GB|12GB|
|월 OCPU 사용량|약 2,976 OCPU-hour|약 1,488 OCPU-hour|
|월 Memory 사용량|약 17,856 GB-hour|약 8,928 GB-hour|

31일 기준으로 계산하면 다음과 같다.

```text
2 OCPU × 24시간 × 31일 = 1,488 OCPU-hour
12GB × 24시간 × 31일 = 8,928 GB-hour
```

현재 무료 한도인 `1,500 OCPU-hour`, `9,000 GB-hour` 안에 들어간다.

반면 기존 `4 OCPU / 24GB` 구성은 현재 기준으로 약 2배 초과한다.

## 내가 축소해야 하는지 확인하는 방법

OCI Console에서 인스턴스 상세 화면을 확인한다.

```text
Compute
→ Instances
→ 사용 중인 인스턴스 선택
```

다음처럼 표시되면 축소 대상이다.

```text
Shape
VM.Standard.A1.Flex

OCPU count
4

Memory (GB)
24
```

안전한 목표값은 다음이다.

```text
Shape
VM.Standard.A1.Flex

OCPU count
2

Memory (GB)
12
```

A1 인스턴스를 여러 개 쓰는 경우에는 전체 합산 기준으로 봐야 한다.

|구성|판단|
|---|---|
|1개 × 2 OCPU / 12GB|안전|
|2개 × 1 OCPU / 6GB|안전|
|1개 × 4 OCPU / 24GB|축소 필요|
|2개 × 2 OCPU / 12GB|축소 필요|
|여러 개 합산 4 OCPU / 24GB|축소 필요|

Oracle 문서상 A1 Always Free는 총 2 OCPU 범위에서 1개 또는 2개 인스턴스를 만들 수 있다고 설명한다. ([docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))

## 축소 전 서버 상태 확인

서버에 SSH로 접속해서 현재 사용량을 확인한다.

```bash
free -h
df -h
uptime
```

Docker를 사용 중이면 다음도 확인한다.

```bash
docker stats
```

메모리 사용량이 12GB에 가깝다면 먼저 불필요한 컨테이너나 서비스를 줄여야 한다.

대부분의 개인용 서버, 간단한 웹 서비스, 봇, 소규모 API, 작은 DB 정도는 `2 OCPU / 12GB`로도 충분할 수 있다.

## Shape 변경 방법

OCI Console에서 다음 순서로 진행한다.

```text
Compute
→ Instances
→ 인스턴스 선택
→ Stop
```

인스턴스 상태가 `Stopped`가 될 때까지 기다린다.

그 다음:

```text
More actions
→ Edit
→ Shape 또는 Shape summary
→ Edit shape
```

또는 인스턴스 상세 화면의 Shape 항목 근처에서 `Edit shape`를 누른다.

Shape는 그대로 둔다.

```text
VM.Standard.A1.Flex
```

값만 다음처럼 변경한다.

```text
OCPU count: 2
Memory: 12GB
```

저장한다.

```text
Save changes
또는
Change shape
```

변경 직후에는 OCI Console에 이전 값이 잠시 그대로 보일 수 있다.  
예를 들어 `2 OCPU / 12GB`로 저장했는데도 인스턴스 상세 화면에 한동안 `4 OCPU / 24GB`처럼 표시될 수 있다.

이 경우 바로 다시 변경하지 말고, 인스턴스 상태와 작업 진행이 안정될 때까지 기다린 뒤 새로고침한다.  
실제 반영 여부는 인스턴스를 다시 시작한 후 서버 안에서 확인하는 것이 가장 확실하다.

```bash
nproc
free -h
```

정상 반영되었다면 다음처럼 보인다.

```text
$ nproc
2
```

```text
$ free -h
               total        used        free      shared  buff/cache   available
Mem:            11Gi       ...
```

`12GB`로 설정했는데 Linux에서 `11Gi` 정도로 보이는 것은 정상이다.

OCI Console은 GB 기준이고, Linux는 GiB 단위로 표시한다. 커널과 시스템 예약분도 일부 제외된다.

## 인스턴스 다시 시작

Shape 값 변경 저장 후 인스턴스를 다시 시작한다.

```text
Start
```

상태가 `Running`이 될 때까지 기다린다.

OCI Console의 표시값은 실제 변경보다 늦게 갱신될 수 있으므로, 콘솔 표시만 보고 실패로 판단하지 않는다.  
서버 접속 후 `nproc`, `free -h` 결과가 목표값에 맞으면 변경은 정상 반영된 것이다.

## 서비스 확인

Docker를 사용 중이면 다음을 확인한다.

```bash
docker ps
docker compose ps
```

필요하면 서비스를 다시 올린다.

```bash
docker compose up -d
```

k3s나 Kubernetes를 사용 중이면 다음을 확인한다.

```bash
kubectl get nodes
kubectl get pods -A
```

웹 서비스를 운영 중이면 외부에서 접속 확인한다.

```bash
curl -I https://example.com
```

## 같이 확인할 것

A1 인스턴스만 확인하면 끝이 아니다.

OCI Always Free에는 Block Volume 한도도 있다.

Oracle 문서 기준으로 Always Free Block Volume은 총 200GB이며, 부트 볼륨과 추가 블록 볼륨을 합산한다. 기본 부트 볼륨도 이 한도에 포함된다. ([docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))

불필요한 볼륨, 백업, 스냅샷이 있다면 정리한다.

또한 Always Free 인스턴스는 유휴 상태로 판단되면 회수될 수 있다. Oracle 문서에는 7일 동안 CPU, 네트워크, 메모리 사용률이 낮으면 idle instance로 간주될 수 있다고 되어 있다. ([docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))

## Pay As You Go 계정이면 더 주의

무료 계정에서 한도를 넘으면 생성 제한, 정지, 회수 같은 문제가 생길 수 있다.

Pay As You Go 계정에서는 한도 초과분이 과금될 수 있다. Oracle 문서도 유료 계정으로 전환해도 Always Free 한도 안의 리소스는 무료지만, 한도 초과 사용량은 과금될 수 있다고 설명한다. ([docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))

따라서 Pay As You Go 계정이라면 예산 알림을 설정해두는 것이 좋다.

```text
Billing & Cost Management
→ Budgets
→ Create Budget
```

최소한 0원 또는 소액 기준으로 알림을 걸어둔다.

## 정리

현재 A1 인스턴스가 다음 구성이라면 축소 대상이다.

```text
VM.Standard.A1.Flex
4 OCPU
24GB Memory
```

현재 문서 기준으로 안전한 구성은 다음이다.

```text
VM.Standard.A1.Flex
2 OCPU
12GB Memory
```

변경 직후 OCI Console에는 이전 Shape 값이 잠시 남아 있을 수 있다.  
이때는 콘솔 표시보다 서버 내부 확인값을 기준으로 본다.

```bash
nproc
# 2

free -h
# Mem total 약 11Gi
```

무료 서버를 계속 안정적으로 쓰려면 다음을 확인해야 한다.

```text
A1 전체 합산 2 OCPU / 12GB 이하
Block Volume 전체 합산 200GB 이하
불필요한 백업/볼륨 정리
Pay As You Go 계정은 예산 알림 설정
```

Oracle Cloud Always Free는 무료 개인 서버로 유용하지만, 무료 정책은 변경될 수 있다. 중요한 서비스라면 백업과 이전 경로를 별도로 준비해두는 것이 안전하다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._