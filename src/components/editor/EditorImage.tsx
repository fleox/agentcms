import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { RemoteImage } from "../ui/RemoteImage";

// Image node rendered through RemoteImage: a picked image that isn't
// live on the host yet (Pages build in progress…) shows a spinner and
// reappears by itself, instead of a broken image in the editor. The
// node's schema and Markdown round-trip are the stock extension's.
function EditorImageView({ node, selected }: NodeViewProps) {
  const { src, alt, title } = node.attrs as { src?: string; alt?: string; title?: string };
  return (
    <NodeViewWrapper as="span" className="inline-block max-w-full align-top" data-drag-handle title={title ?? undefined}>
      <RemoteImage
        src={src}
        alt={alt ?? ""}
        className={"inline-block max-w-full rounded " + (selected ? "ring-2 ring-blue-500" : "")}
        imgClassName="block max-w-full h-auto"
        pendingClassName="h-40 w-64"
      />
    </NodeViewWrapper>
  );
}

export const EditorImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(EditorImageView);
  },
});
