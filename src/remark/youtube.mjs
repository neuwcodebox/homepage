import { visit } from 'unist-util-visit';

const VIDEO_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }

    let id;
    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be') {
      id = parsed.pathname.split('/')[1];
    } else if (parsed.hostname === 'youtube.com' || parsed.hostname === 'www.youtube.com') {
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.split('/')[2];
      }
    }

    return id && VIDEO_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default function remarkYouTube() {
  return (tree) => {
    visit(tree, 'image', (node, index, parent) => {
      const videoId = getYouTubeId(node.url);
      if (!videoId || index === undefined || !parent) {
        return;
      }

      parent.children[index] = {
        type: 'mdxJsxTextElement',
        name: 'span',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'youtube-embed' }],
        children: [
          {
            type: 'mdxJsxTextElement',
            name: 'iframe',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'src', value: `https://www.youtube-nocookie.com/embed/${videoId}` },
              { type: 'mdxJsxAttribute', name: 'title', value: node.alt || 'YouTube video' },
              { type: 'mdxJsxAttribute', name: 'loading', value: 'lazy' },
              {
                type: 'mdxJsxAttribute',
                name: 'allow',
                value:
                  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
              },
              { type: 'mdxJsxAttribute', name: 'allowFullScreen', value: null },
            ],
            children: [],
          },
        ],
      };
    });
  };
}
