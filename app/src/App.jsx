import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState(`// Visit https://flexa-script.github.io/ for docs

println("Hello there!");
var name = read("What's your name? ");
println("Nice to meet you, " + name + '!');
`);
  const [consoleText, setConsoleText] = useState('');
  const [inputStart, setInputStart] = useState(0);
  const [allowInput, setAllowInput] = useState(false);
  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const userId = useRef(uuidv4());

  useEffect(() => {    
    const wsBase = `ws://${window.location.host.split(':')[0]}:4001/flexa-server/ws`;
    const socket = new WebSocket(wsBase);
    socketRef.current = socket;

    socket.onopen = () => console.log('WebSocket connected');

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output' || msg.type === 'error') {
        appendToConsole(msg.data);
      } else if (msg.type === 'exit') {
        setAllowInput(false);
        appendToConsole(`\nProcess closed with code ${msg.code}\n`);
      }
    };

    socket.onclose = () => console.log('WebSocket disconected');

    return () => socket.close();
  }, []);

  const appendToConsole = (text) => {
    setConsoleText(prev => {
      const newText = prev + text;
      setTimeout(() => {
        setInputStart(newText.length);
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newText.length, newText.length);
      }, 0);
      return newText;
    });
  };

  const handleRun = () => {
    setAllowInput(true);
    setConsoleText('');
    setInputStart(0);
    socketRef.current.send(JSON.stringify({
      type: 'code',
      userId: userId.current,
      code
    }));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length < inputStart) return;

    setConsoleText(prev => {
      const fixed = prev.slice(0, inputStart);
      return fixed + value.slice(inputStart);
    });
  };

  const handleKeyDown = (e) => {
    if (!allowInput){
      e.preventDefault();
      return;
    }

    const cursorPos = textareaRef.current.selectionStart;

    // prevent move cursor to before current input
    if (cursorPos < inputStart) {
      e.preventDefault();
      textareaRef.current.setSelectionRange(consoleText.length, consoleText.length);
    }

    if (e.key === 'Backspace' && cursorPos <= inputStart) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const input = consoleText.slice(inputStart);
      socketRef.current.send(JSON.stringify({
        type: 'input',
        data: input
      }));
      appendToConsole('\n');
    }
  };

  return (
    <div className="ide-container">
      <div className="topbar">
        <button className="topbar-btn" onClick={handleRun}>▶ Run</button>
        <div className="vertical-div"></div>
        <a className="topbar-btn" target="_blank" href="https://flexa-script.github.io/">🗎 Docs</a>
        <a className="topbar-btn" target="_blank" href="https://github.com/flexa-script">🌐 GitHub</a>
        <a className="topbar-btn" target="_blank" href="https://github.com/flexa-script/interpreter">🌐 Interpreter</a>
      </div>

      <div className="editor-container">
        <Editor
          // height="100%"
          defaultLanguage="go"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      <textarea
        ref={textareaRef}
        value={consoleText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="terminal-textarea"
        spellCheck={false}
      />
    </div>
  );
}

export default App;
