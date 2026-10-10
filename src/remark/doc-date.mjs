import path from 'node:path';

/** Read a real calendar date from the existing YYYY-MM-DD-name convention. */
export function getDocDate(filePath) {
  const date = /^(\d{4}-\d{2}-\d{2})-/.exec(path.basename(filePath ?? ''))?.[1];
  if (!date) {
    return null;
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return null;
  }
  return date;
}

/** Runs after Docusaurus has identified and wrapped the Markdown title. */
export default function remarkDocDate() {
  return (tree, file) => {
    const date = getDocDate(file.path);
    if (!date) {
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('ko', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00.000Z`));
    const dateNode = {
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'doc-date margin-vert--md' }],
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'time',
          attributes: [{ type: 'mdxJsxAttribute', name: 'dateTime', value: date }],
          children: [{ type: 'text', value: formattedDate }],
        },
      ],
    };
    const titleHeader = tree.children.find(
      (node) =>
        node.type === 'mdxJsxFlowElement' &&
        node.name === 'header' &&
        node.children.some((child) => child.type === 'heading' && child.depth === 1),
    );
    if (titleHeader) {
      titleHeader.children.push(dateNode);
    } else {
      // DocItem/Content renders front-matter/automatic titles before MDX content.
      tree.children.unshift(dateNode);
    }
  };
}
