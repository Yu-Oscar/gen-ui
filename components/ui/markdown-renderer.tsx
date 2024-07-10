import React from 'react';
import ReactMarkdown from 'react-markdown';
import customRemarkPlugin from './customRemarkPlugin';

const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            children={content}
            remarkPlugins={[customRemarkPlugin]}
        />
    );
};

export default MarkdownRenderer;