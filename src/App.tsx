import { useState } from "react";
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

function App() {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash-002',
    temperature: 0,
    maxRetries: 2,
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "For the following medical terms, provide (1) IPA transcription: (e.g., /ˌkɑːrdɪoʊˈmaɪəpəθi/), (2) Breakdown: (e.g., 'Cardio-': /ˈkɑːrdɪoʊ/ - Heart, '-myo-': /ˈmaɪoʊ/ - Muscle, '-pathy': /ˈpæθi/ - Disease or disorder), (3) Meaning: (e.g., 'Disease of the heart muscle.')"],
    ["human", "{input}"],
  ]);
  const chain = prompt.pipe(llm);

  const [term, setTerm] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  return (
    <PrimeReactProvider>
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
          <audio id="audio" src={`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${term}`} controls></audio>
          <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
        </div>
      )}
    </PrimeReactProvider>
  );
}

export default App;
