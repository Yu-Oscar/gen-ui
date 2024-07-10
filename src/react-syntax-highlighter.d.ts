declare module 'react-syntax-highlighter' {
    import * as React from 'react';
  
    export interface SyntaxHighlighterProps {
      language?: string;
      style?: object;
      children?: React.ReactNode;
      showLineNumbers?: boolean;
      PreTag?: string;
    }
  
    export class Light extends React.Component<SyntaxHighlighterProps> {}
    export class Prism extends React.Component<SyntaxHighlighterProps> {}
    export class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {}
}
  

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
    export const dark: any;
    // You can add more style exports here if you need them
}
  