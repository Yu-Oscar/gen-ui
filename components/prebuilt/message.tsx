import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface MessageTextProps {
  content: string;
}

export function AIMessageText(props: MessageTextProps) {
  return (
    // <div className="flex mr-auto w-fit max-w-[700px] bg-blue-400 rounded-md px-2 py-1 mt-3">
    //   <p className="text-normal text-gray-50 text-left break-words">
    //     <Markdown>{props.content}</Markdown>
    //   </p>
    // </div>
    <div className="flex flex-row mb-4 mr-auto">
      <div className="rounded-2xl py-2 px-4 bg-blue-500 shadow-md flex">
        <p className="text-primary">
        <Markdown
          children={props.content}
          components={{
            code(props) {
              const {children, className, node, ...rest} = props
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  style={customStyle}
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              )
            }
          }}
        />
          {/* <Markdown>{props.content}</Markdown> */}
        </p>
      </div>
    </div>
  );
}

export function HumanMessageText(props: MessageTextProps) {
  return (
    // <div className="flex ml-auto w-fit max-w-[700px] bg-gray-200 rounded-md px-2 py-1">
    //   <p className="text-normal text-gray-800 text-left break-words">
    //     {props.content}
    //   </p>
    // </div>
    <div className="flex flex-row-reverse mb-4 ml-auto">
      <div className="rounded-2xl py-2 px-4 bg-slate-400 shadow-md flex">
        <p className="text-primary">
          {props.content}
        </p>
      </div>
    </div>
  );
}

const customStyle = {
  'code[class*="language-"]': {
    color: '#f8f8f2',
    fontSize: '1em',
    lineHeight: '1.5',
    textShadow: 'none',
    borderRadius: '8px',
  },
  'pre[class*="language-"]': {
    background: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1em',
    textShadow: 'none',
    overflow: 'auto',
  },
  'pre[class*="language-"]::-webkit-scrollbar': {
    width: '0.4em',
  },
  'pre[class*="language-"]::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
    outline: '1px solid slategrey',
  },
  'comment': { color: '#6a9955' },
  'keyword': { color: '#569cd6' },
  'string': { color: '#d69d85' },
  'operator': { color: '#c586c0' },
  'function': { color: '#dcdcaa' },
  'variable': { color: '#9cdcfe' },
  'number': { color: '#b5cea8' },
  'builtin': { color: '#dcdcaa' },
  'class-name': { color: '#4ec9b0' },
  'punctuation': { color: '#f8f8f2' },
  'attr-name': { color: '#9cdcfe' },
  'tag': { color: '#569cd6' },
  'property': { color: '#c586c0' },
  'selector': { color: '#d7ba7d' },
  'constant': { color: '#4ec9b0' },
  'char': { color: '#d7ba7d' },
  'boolean': { color: '#569cd6' },
  'atrule': { color: '#c586c0' },
  'important': { color: '#c586c0' },
  'regex': { color: '#d16969' },
  'entity': { color: '#d7ba7d' },
};
