import { useEffect, useState } from "react";
import remarkGfm from 'remark-gfm';

import 'primereact/resources/themes/lara-dark-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex

import { PrimeReactProvider } from 'primereact/api';
import { InputText } from "primereact/inputtext";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import Markdown from "react-markdown";
import { Divider } from "primereact/divider";
import { ProgressBar } from "primereact/progressbar";        

import { Dialog } from 'primereact/dialog';

function App() {
  const [chain, setChain] = useState<any>();
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    if (apiKey.length > 0) {
      const llm = new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-flash-002',
        temperature: 0,
        maxRetries: 2,
        apiKey,
      })
    
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", "For the following medical terms, provide (1) IPA transcription: (e.g., /ˌkɑːrdɪoʊˈmaɪəpəθi/), (2) Breakdown: (e.g., 'Cardio-': /ˈkɑːrdɪoʊ/ - Heart, '-myo-': /ˈmaɪoʊ/ - Muscle, '-pathy': /ˈpæθi/ - Disease or disorder), (3) Meaning: (e.g., 'Disease of the heart muscle.')"],
        ["human", "{input}"],
      ]);
      setChain(prompt.pipe(llm));
    }
  }, [apiKey]);

  const [term, setTerm] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  return (
    <PrimeReactProvider>
      {apiKey.length === 0 && (
        <Dialog header="Gemini API Key" visible={apiKey.length === 0} style={{ width: '50vw' }} onHide={() => {}}>
          <div className="flex flex-center p-2">
            <InputText id="term-input" aria-describedby="term-input-help"
              onKeyUp={async (event) => {
                if (event.key === "Enter") {
                  const value = event.currentTarget.value;
                  setApiKey(value);
                }
              }}
            />
          </div>
          <div>
            <div>&nbsp;</div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                Get an API Key
            </a>
          </div>
      </Dialog>
      )}
      {chain && <div>
        <div className="flex flex-column gap-2 p-2">
          <label htmlFor="term-input">Medical term</label>
          <InputText id="term-input" aria-describedby="term-input-help"
            onKeyUp={async (event) => {
              if (event.key === "Enter") {
                const value = event.currentTarget.value;
                setTerm(value);
                
                setIsSearching(true);
                const response = await chain.invoke({
                  input: value
                });
                setMarkdown(response.content.toString());
                setIsSearching(false);
              }
            }}
          />
          <small id="term-input-help">
            Press Enter to search a medical term for its IPA transcription, breakdown, and meaning.
          </small>
        </div>
      <Divider />
      {!markdown && isSearching && <ProgressBar mode="indeterminate" style={{ height: '3px' }}></ProgressBar>}
      {markdown && (
        <div>
          <audio id="audio" src={`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${term}`} autoPlay controls></audio>
          <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
        </div>
      )}
      </div>}
    </PrimeReactProvider>
  );
}

export default App;
