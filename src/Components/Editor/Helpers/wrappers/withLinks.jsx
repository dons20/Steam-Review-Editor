import { Transforms, Editor } from "slate";
import isUrl from "is-url";

export const insertLink = (editor, url) => {
    if (editor.selection) {
        wrapLink(editor, url);
    }
};

const isLinkActive = (editor) => {
    const [link] = Editor.nodes(editor, { match: (n) => n.type === "link" });
    return !!link;
};

const unwrapLink = (editor) => {
    Transforms.unwrapNodes(editor, { match: (n) => n.type === "link" });
};

const wrapLink = (editor, url) => {
    if (isLinkActive(editor)) {
        unwrapLink(editor);
    }

    const { selection } = editor;
    // @ts-ignore
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link = {
        type: "link",
        url,
        children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
        Transforms.insertNodes(editor, link);
    } else {
        Transforms.wrapNodes(editor, link, { split: true });
        Transforms.collapse(editor, { edge: "end" });
    }
};

const withLinks = (editor) => {
    const { insertData, insertText, isInline } = editor;

    editor.isInline = (element) => {
        return element.type === "link" ? true : isInline(element);
    };

    editor.insertText = (text) => {
        if (text && isUrl(text)) {
            wrapLink(editor, text);
        } else {
            insertText(text);
        }
    };

    editor.insertData = (data) => {
        const text = data.getData("text/plain");

        if (text && isUrl(text)) {
            wrapLink(editor, text);
        } else {
            insertData(data);
        }
    };

    return editor;
};

export default withLinks;
