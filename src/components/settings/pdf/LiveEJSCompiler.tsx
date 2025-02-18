import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { cssStyle, ejsData, html } from './TestCode';
import { useDebounce } from '@/hooks/other/useDebounce';
import { CodeBlock } from '@/components/ui/code-block';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface LiveEJSCompilerProps {
  className?: string;
}

const LiveEJSCompiler: React.FC<LiveEJSCompilerProps> = ({ className }) => {
  const [HTMLCode, setHTMLCode] = useState<string>(html);
  const { value: debouncedHTML } = useDebounce<string>(HTMLCode, 500);

  const [CSSCode, setCSSCode] = useState<string>(cssStyle);
  const { value: debouncedCSS } = useDebounce<string>(CSSCode, 500);

  const [data, setData] = useState<string>(ejsData);
  const { value: debouncedData } = useDebounce<string>(data, 500);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const compileTemplate = () => {
    try {
      const dataObj = JSON.parse(debouncedData);
      const output = window.ejs.render(debouncedHTML, dataObj);

      // Get the iframe document and inject HTML and CSS
      if (iframeRef.current?.contentDocument) {
        const iframeDocument = iframeRef.current.contentDocument;
        iframeDocument.open();
        iframeDocument.write(`
        <html>
          <head>
            <style>
              ${CSSCode}
            </style>
          </head>
          <body>${output}</body>
        </html>
      `);
        iframeDocument.close();
      }
    } catch (err) {
      console.error('Error compiling template or parsing data:', err);
    }
  };

  React.useEffect(() => {
    compileTemplate();
  }, [debouncedHTML, debouncedCSS, debouncedData]);

  return (
    <div className="flex items-center justify-between">
      <div className={cn('w-1/2 gap-5', className)}>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-md"> Layout (HTML)</Label>
            <CodeBlock
              className="mt-5"
              height="95vh"
              value={HTMLCode}
              onChange={(e) => setHTMLCode(e.target.value)}
              defaultLanguage="html"
            />
          </div>
          <Accordion type="multiple">
            <AccordionItem value="css">
              <AccordionTrigger>Styles (CSS)</AccordionTrigger>
              <AccordionContent>
                <CodeBlock
                  className="my-2"
                  height="33vh"
                  value={CSSCode}
                  onChange={(e) => setCSSCode(e.target.value)}
                  defaultLanguage="css"
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data">
              <AccordionTrigger> Data (JSON)</AccordionTrigger>
              <AccordionContent>
                <CodeBlock
                  className="my-2"
                  height="33vh"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  defaultLanguage="json"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div></div>
      </div>
      <div className="w-1/2 p-10">
        <iframe ref={iframeRef} className="border-2 rounded-lg w-full h-screen" />
      </div>
    </div>
  );
};

export default LiveEJSCompiler;
