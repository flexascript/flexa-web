import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState(`// Visit https://flexascript.github.io/ for docs

println("Hello there!");
var name = read("What's your name? ");
println("Nice to meet you, " + name + '!');
`);
  const [consoleText, setConsoleText] = useState('');
  const [inputStart, setInputStart] = useState(0);
  const [allowInput, setAllowInput] = useState(false);
  const [editorHeight, setEditorHeight] = useState(70); // percent height of editor
  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const userId = useRef(uuidv4());
  const isResizing = useRef(false);
  const isRunning = useRef(false);

  useEffect(() => {
    const wsBase = isHttps() ?
      `wss://homeserver.trout-universe.ts.net/flexa-server/ws`
      :
      `ws://localhost:8080/flexa-server/ws`;
    const socket = new WebSocket(wsBase);
    socketRef.current = socket;

    socket.onopen = () => console.log('WebSocket connected');

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output' || msg.type === 'error') {
        appendToConsole(msg.data);
      } else if (msg.type === 'exit') {
        isRunning.current = false;
        setAllowInput(false);
        appendToConsole(`\nProcess closed with code ${msg.code}\n`);
      }
    };

    socket.onclose = () => console.log('WebSocket disconnected');
    return () => socket.close();
  }, []);
  
  const isHttps = () => {
    return window.location.protocol === 'https:';
  };

  const appendToConsole = (text) => {
    setConsoleText(prev => {
      const newText = prev + text;
      setTimeout(() => {
        setInputStart(newText.length);
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newText.length, newText.length);
        }
      }, 0);
      return newText;
    });
  };

  const handleRun = () => {
    if (isRunning.current) return;
    isRunning.current = true;
    setAllowInput(true);
    setConsoleText('');
    setInputStart(0);
    socketRef.current.send(JSON.stringify({
      type: 'code',
      userId: userId.current,
      code
    }));
  };

  const handleStop = () => {
    if (!isRunning.current) return;
    isRunning.current = false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'stop',
        userId: userId.current
      }));
      setAllowInput(false);
      appendToConsole('\nProcess stopped by user.\n');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length < inputStart) return;
    setConsoleText(prev => prev.slice(0, inputStart) + value.slice(inputStart));
  };

  const handleKeyDown = (e) => {
    if (!allowInput) {
      e.preventDefault();
      return;
    }
    const cursorPos = textareaRef.current.selectionStart;
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
      socketRef.current.send(JSON.stringify({ type: 'input', data: input }));
      appendToConsole('\n');
    }
  };

  // --- handle resize ---
  const handleMouseDown = () => (isResizing.current = true);
  const handleMouseUp = () => (isResizing.current = false);
  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const containerHeight = window.innerHeight;
    const newHeight = (e.clientY / containerHeight) * 100;
    if (newHeight > 10 && newHeight < 90) setEditorHeight(newHeight);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="ide-container">
      <div className="topbar">
        <button className="topbar-btn run" onClick={handleRun}>▶ Run</button>
        <button className="topbar-btn stop" onClick={handleStop}>⏹ Stop</button>
        <div className="vertical-div"></div>
        <a className="topbar-btn" target="_blank" href="https://flexascript.github.io/">🗎 Docs</a>
        <a className="topbar-btn" target="_blank" href="https://flexascript.github.io/docs/advanced-examples">💡 Examples</a>
        <a className="topbar-btn" target="_blank" href="https://github.com/flexascript/interpreter">⚙️ Actual Interpreter</a>
        <a className="topbar-btn" target="_blank" href="https://github.com/flexascript">🌐 FlexaScript GitHub</a>
      </div>

      <div className="editor-container" style={{ height: `${editorHeight}%` }}>
        <Editor
          defaultLanguage="go"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      <div className="resizer" onMouseDown={handleMouseDown}><span>• • •</span></div>

      <textarea
        id="console"
        ref={textareaRef}
        value={consoleText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="terminal-textarea"
        spellCheck={false}
        style={{ height: `calc(${100 - editorHeight}% - 57px)` }}
      />
    </div>
  );
}

export default App;
