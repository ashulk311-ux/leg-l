import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

export function TinyMCEEditor({ value, onChange, height = 500 }: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        apiKey="fmb0i6rpeffbzotml984trbq4kdsm376h6b35o0e2rfk902n"
        init={{
          height: height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
            'imagetools', 'textpattern', 'noneditable', 'quickbars', 'accordion'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | fullscreen | preview | ' +
            'insertdatetime | table | charmap emoticons | ' +
            'link image media | codesample | hr pagebreak | ' +
            'searchreplace | wordcount | toc',
          content_style: `
            body { 
              font-family: Georgia, "Times New Roman", serif; 
              font-size: 16px; 
              line-height: 1.8; 
              color: #1f2937; 
              background-color: #ffffff;
              padding: 24px;
            }
          `,
          skin: 'oxide',
          content_css: 'default',
          branding: false,
          promotion: false,
          resize: false,
          statusbar: true,
          elementpath: true,
          contextmenu: 'link image imagetools table spellchecker configurepermanentpen',
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
          quickbars_insert_toolbar: 'quickimage quicktable',
          templates: [
            { title: 'New Table', content: '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>' },
            { title: 'Starting my story', content: 'Once upon a time...' },
            { title: 'New list with dates', content: '<ol><li><p>January 1st</p></li><li><p>February 1st</p></li></ol>' }
          ],
          setup: (editor) => {
            editor.on('init', () => {
              console.log('TinyMCE Editor initialized');
            });
          }
        }}
      />
    </div>
  );
}
