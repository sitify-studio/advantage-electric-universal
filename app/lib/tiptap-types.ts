// Type definitions for Tiptap JSON content

export interface TiptapText {
  type: 'text';
  text?: string;
  marks?: TiptapMark[];
}

export interface TiptapMark {
  type:
    | 'bold'
    | 'italic'
    | 'strike'
    | 'strikethrough'
    | 'code'
    | 'link'
    | 'underline'
    | 'highlight'
    | 'textStyle';
  attrs?: {
    href?: string;
    target?: string;
    rel?: string;
    color?: string;
    backgroundColor?: string;
    [key: string]: any;
  };
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapContent[];
  marks?: TiptapMark[];
  text?: string;
}

export type TiptapContent = string | TiptapText | TiptapNode;

export interface TiptapDoc {
  type: 'doc';
  content: TiptapNode[];
}

export interface TiptapParagraph {
  type: 'paragraph';
  content?: TiptapContent[];
}

export interface TiptapHeading {
  type: 'heading';
  attrs?: {
    level?: number;
  };
  content?: TiptapContent[];
}

export interface TiptapBlockquote {
  type: 'blockquote';
  content?: TiptapContent[];
}

export interface TiptapCodeBlock {
  type: 'codeBlock';
  content?: TiptapContent[];
}

export interface TiptapBulletList {
  type: 'bulletList';
  content?: TiptapNode[];
}

export interface TiptapOrderedList {
  type: 'orderedList';
  content?: TiptapNode[];
}

export interface TiptapListItem {
  type: 'listItem';
  content?: TiptapContent[];
}

export interface TiptapHardBreak {
  type: 'hardBreak';
}

// Union type for all possible Tiptap nodes
export type TiptapAnyNode = 
  | TiptapDoc
  | TiptapParagraph
  | TiptapHeading
  | TiptapBlockquote
  | TiptapCodeBlock
  | TiptapBulletList
  | TiptapOrderedList
  | TiptapListItem
  | TiptapHardBreak
  | TiptapText;
