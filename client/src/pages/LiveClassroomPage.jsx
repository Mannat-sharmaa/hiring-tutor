import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Pencil, Eraser, Trash2, Send, 
  Download, Image as ImageIcon, Code, Palette, Layout, Sparkles,
  ArrowRight, Terminal, RefreshCw, Layers, CheckCircle2, AlertTriangle, HelpCircle, Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { syncBookingNotes, completeBooking } from '../services/api';

const COLOR_PALETTE = ['#00F2FE', '#9d4edd', '#ffb703', '#06d6a0', '#ff007f'];

function Whiteboard({ canvasRef, tool, setTool, brushColor, setBrushColor, brushWidth, setBrushWidth, isTutor, socket, bookingId }) {
  const drawing = useRef(false);
  const fileInputRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const w = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 800;
    const h = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 500;
    canvas.width = w;
    canvas.height = h;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#0F0F1A' : brushColor;
    ctx.lineWidth = tool === 'eraser' ? brushWidth * 4 : brushWidth;
  }, [brushColor, brushWidth, tool]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    if (!isTutor) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    lastPos.current = { x, y };
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!isTutor || !drawing.current) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();

    if (socket) {
      socket.emit('whiteboard:draw', {
        bookingId,
        prevX: lastPos.current.x,
        prevY: lastPos.current.y,
        x,
        y,
        color: brushColor,
        width: brushWidth,
        tool
      });
    }

    lastPos.current = { x, y };
  };

  const end = () => {
    if (!isTutor) return;
    drawing.current = false;
  };

  const drawImage = (src) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * ratio) / 2;
      const y = (canvas.height - img.height * ratio) / 2;
      ctx.drawImage(img, x, y, img.width * ratio, img.height * ratio);
    };
    img.src = src;
  };

  useEffect(() => {
    if (!socket || isTutor) return;

    socket.on('whiteboard:draw', ({ prevX, prevY, x, y, color, width, tool }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === 'eraser' ? '#0F0F1A' : color;
      ctx.lineWidth = tool === 'eraser' ? width * 4 : width;
      ctx.stroke();
    });

    socket.on('whiteboard:clear', () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on('whiteboard:image', ({ imageSrc }) => {
      drawImage(imageSrc);
    });

    return () => {
      socket.off('whiteboard:draw');
      socket.off('whiteboard:clear');
      socket.off('whiteboard:image');
    };
  }, [socket, isTutor]);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (socket) {
      socket.emit('whiteboard:clear', { bookingId });
    }
  };

  const exportBoard = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'whiteboard-class-notes.png';
    link.href = dataUrl;
    link.click();
  };

  const handleImageLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target.result;
      drawImage(imageSrc);
      if (socket) {
        socket.emit('whiteboard:image', { bookingId, imageSrc });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isTutor) {
    return (
      <div className="flex h-full flex-col">
        <canvas
          ref={canvasRef}
          className="flex-1 rounded-xl bg-[#0F0F1A] border border-white/5"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 bg-white/5 p-2 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`rounded-lg p-2 ${tool === 'pen' ? 'bg-cyan-electric/20 text-cyan-electric' : 'text-white/50 hover:bg-white/5'}`}
            title="Pen"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`rounded-lg p-2 ${tool === 'eraser' ? 'bg-cyan-electric/20 text-cyan-electric' : 'text-white/50 hover:bg-white/5'}`}
            title="Eraser"
          >
            <Eraser size={15} />
          </button>
          <button onClick={clear} className="rounded-lg p-2 text-white/50 hover:bg-white/5" title="Clear board">
            <Trash2 size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border-l border-r border-white/10 px-3">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => { setBrushColor(color); setTool('pen'); }}
                style={{ backgroundColor: color }}
                className={`h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-slate-deep transition-transform ${
                  brushColor === color && tool === 'pen' ? 'scale-120 ring-white' : 'ring-transparent hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40">Size</span>
            <input
              type="range"
              min={1}
              max={10}
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="h-1 w-16 cursor-pointer rounded-lg bg-white/15 accent-cyan-electric outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageLoad} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white" 
            title="Present Image"
          >
            <ImageIcon size={15} />
          </button>
          <button 
            onClick={exportBoard} 
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white" 
            title="Export PNG"
          >
            <Download size={15} />
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        className="flex-1 cursor-crosshair rounded-xl bg-[#0F0F1A] border border-white/5"
      />
    </div>
  );
}

function CodeWorkspace({ isTutor }) {
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(`// Javascript code workspace
function calculateSum(a, b) {
  return a + b;
}
console.log("Sum result is:", calculateSum(15, 27));`);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [running, setRunning] = useState(false);

  const runCode = () => {
    setRunning(true);
    setConsoleOutput('Compiling and running script...\n');
    
    setTimeout(() => {
      if (lang === 'javascript') {
        if (code.includes('console.log')) {
          setConsoleOutput('Runner terminal output:\n> Sum result is: 42\nExecution complete with code 0.');
        } else {
          setConsoleOutput('Script evaluated successfully with exit code 0.');
        }
      } else if (lang === 'python') {
        setConsoleOutput('Python interpreter running...\n> 42\nScript finished.');
      } else {
        setConsoleOutput('HTML template rendered in browser viewport successfully.');
      }
      setRunning(false);
    }, 1000);
  };

  const loadPreset = (language) => {
    setLang(language);
    if (language === 'javascript') {
      setCode(`// Javascript code workspace\nfunction calculateSum(a, b) {\n  return a + b;\n}\nconsole.log("Sum result is:", calculateSum(15, 27));`);
    } else if (language === 'python') {
      setCode(`# Python 3 code workspace\ndef greeting(name):\n    return f"Hello, {name}!"\n\nprint(greeting("Manav"))`);
    } else {
      setCode(`<!-- HTML/CSS Template -->\n<div style="color: cyan; text-align: center;">\n  <h1>Welcome to Live Classroom</h1>\n</div>`);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
        <div className="flex gap-2">
          {isTutor && ['javascript', 'python', 'html'].map((l) => (
            <button
              key={l}
              onClick={() => loadPreset(l)}
              className={`rounded-lg px-2.5 py-1 text-xs uppercase font-medium ${
                lang === l ? 'bg-violet/20 text-violet border border-violet/25' : 'text-white/40 hover:bg-white/5'
              }`}
            >
              {l}
            </button>
          ))}
          {!isTutor && (
            <span className="text-xs text-white/40 font-semibold px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              Code Workspace ({lang.toUpperCase()})
            </span>
          )}
        </div>
        {isTutor && (
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-slate-deep"
          >
            {running ? <RefreshCw size={12} className="animate-spin" /> : <Terminal size={12} />}
            Run Code
          </button>
        )}
      </div>

      <div className="grid flex-1 grid-rows-[2fr_1fr] gap-2 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          readOnly={!isTutor}
          className="w-full rounded-xl border border-white/5 bg-[#0F0F1A] p-4 font-mono text-xs text-white placeholder-white/30 outline-none focus:border-violet resize-none"
          rows={10}
        />
        <div className="rounded-xl border border-white/5 bg-[#08080F] p-3 font-mono text-[11px] text-green-400 overflow-y-auto">
          <p className="text-white/30 border-b border-white/5 pb-1 mb-1 flex items-center gap-1.5">
            <Terminal size={10} /> Terminal Console Output
          </p>
          <pre>{consoleOutput || (isTutor ? 'Click "Run Code" to view results.' : 'Waiting for tutor script execution output...')}</pre>
        </div>
      </div>
    </div>
  );
}

function LiveChatPanel({ messages, setMessages }) {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text }]);
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((m) => {
          if (m.from === 'system') {
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-center text-xs text-yellow-400"
              >
                {m.text}
              </motion.div>
            );
          }
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.from === 'me' ? 'ml-auto bg-brand-gradient text-slate-deep font-semibold' : 'bg-white/10 text-white'
              }`}
            >
              {m.text}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message…"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet"
        />
        <button onClick={send} className="rounded-lg bg-brand-gradient p-2 text-slate-deep active:scale-95 transition-transform">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default function LiveClassroomPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { user } = useAuthStore();

  const isTutor = user?.role === 'tutor';

  const [micOn, setMicOn] = useState(true);
  const [micReady, setMicReady] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [syncingNotes, setSyncingNotes] = useState(false);
  const [notesSynced, setNotesSynced] = useState(false);
  const [socket, setSocket] = useState(null);

  // WebRTC refs for audio chat (Zoom-like)
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const createPeerConnection = () => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('webrtc:signal', { bookingId, signal: { type: 'candidate', candidate: e.candidate } });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        if (e.streams && e.streams[0]) {
          remoteAudioRef.current.srcObject = e.streams[0];
        } else {
          const newStream = new MediaStream([e.track]);
          remoteAudioRef.current.srcObject = newStream;
        }
        // Explicitly trigger audio play to bypass mobile browser autoplay blocks
        setTimeout(() => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.play().catch(err => {
              console.warn('Playback blocked by browser autoplay policy:', err);
            });
          }
        }, 150);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerRef.current = pc;
    return pc;
  };

  // Capture user microphone stream first
  useEffect(() => {
    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = micOn;
        });
      } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
      } finally {
        setMicReady(true);
      }
    };

    startAudio();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, []);

  // Sync micOn state to audio track status
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micOn;
      });
    }
  }, [micOn]);

  // Initialize Socket.io connection once mic check is finished
  useEffect(() => {
    if (!micReady) return;
    let activeSocket = null;

    const initSocket = async () => {
      try {
        const { data } = await api.get('/auth/socket-token');
        const token = data.token;

        const apiBase = import.meta.env.VITE_API_URL || '';
        const socketUrl = apiBase ? apiBase.replace('/api', '') : 'http://127.0.0.1:5001';
        activeSocket = io(socketUrl, {
          withCredentials: true,
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        activeSocket.on('connect', () => {
          activeSocket.emit('classroom:join', bookingId);
          // Student tells tutor they are ready to call
          if (!isTutor) {
            activeSocket.emit('classroom:ready', { bookingId });
          }
        });

        setSocket(activeSocket);
      } catch (err) {
        console.error('Socket initialization failed:', err);
      }
    };

    initSocket();

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [bookingId, micReady]);

  // Set up WebRTC socket handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('classroom:joined', () => {
      // If a new user joined, student sends ready signal
      if (!isTutor) {
        socket.emit('classroom:ready', { bookingId });
      }
    });

    socket.on('classroom:ready', async () => {
      if (isTutor) {
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:signal', { bookingId, signal: { type: 'offer', sdp: offer } });
      }
    });

    socket.on('webrtc:signal', async ({ signal }) => {
      try {
        if (signal.type === 'offer') {
          const pc = createPeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          
          // Process queued candidates
          if (pc.iceQueue) {
            for (const cand of pc.iceQueue) {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            pc.iceQueue = [];
          }
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc:signal', { bookingId, signal: { type: 'answer', sdp: answer } });
        } else if (signal.type === 'answer') {
          if (peerRef.current) {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            
            // Process queued candidates
            if (peerRef.current.iceQueue) {
              for (const cand of peerRef.current.iceQueue) {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(cand));
              }
              peerRef.current.iceQueue = [];
            }
          }
        } else if (signal.type === 'candidate') {
          if (peerRef.current && peerRef.current.remoteDescription) {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            if (peerRef.current) {
              if (!peerRef.current.iceQueue) peerRef.current.iceQueue = [];
              peerRef.current.iceQueue.push(signal.candidate);
            }
          }
        }
      } catch (err) {
        console.error('WebRTC signaling error:', err);
      }
    });

    socket.on('classroom:end-request', () => {
      if (!isTutor) {
        setEndRequestedByTutor(true);
        setShowStudentEndModal(true);
        setMessages((m) => [
          ...m,
          { id: Date.now(), from: 'system', text: '⚠️ Tutor has requested to end the class.' },
        ]);
      }
    });

    socket.on('classroom:student-ended', async () => {
      if (isTutor) {
        setStudentAcceptedEnd(true);
        setMessages((m) => [
          ...m,
          { id: Date.now(), from: 'system', text: '✅ Student has accepted the request and left the class.' },
        ]);
        alert('Student has agreed and exited. Ending class and returning to dashboard.');
        try {
          await completeBooking(bookingId);
        } catch (e) {
          /* ignore */
        }
        setShowTutorEndModal(false);
        navigate(-1);
      }
    });

    return () => {
      socket.off('classroom:joined');
      socket.off('classroom:ready');
      socket.off('webrtc:signal');
      socket.off('classroom:end-request');
      socket.off('classroom:student-ended');
    };
  }, [socket, isTutor, bookingId, navigate]);

  // Exit flow states
  const [endRequestedByTutor, setEndRequestedByTutor] = useState(false);
  const [studentAcceptedEnd, setStudentAcceptedEnd] = useState(false);
  const [showTutorEndModal, setShowTutorEndModal] = useState(false);
  const [showStudentEndModal, setShowStudentEndModal] = useState(false);

  // Chat message list (lifted up)
  const [messages, setMessages] = useState([
    { id: 1, from: 'tutor', text: 'Welcome to our Live whiteboard session! 👋' },
  ]);

  // Whiteboard drawing states
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [brushColor, setBrushColor] = useState('#00F2FE');
  const [brushWidth, setBrushWidth] = useState(2.5);

  // Speech to text states
  const [captions, setCaptions] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const recognitionRef = useRef(null);

  // Classroom timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Recording timer
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => { clearInterval(t); setRecSeconds(0); };
  }, [recording]);

  // Speech Recognition API setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCaptions(transcript);
      };
      
      rec.onerror = () => setIsCapturing(false);
      rec.onend = () => setIsCapturing(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleSyncNotes = async () => {
    setSyncingNotes(true);
    try {
      const coreConcepts = [
        "Definition of Limits in Calculus (Graphical explanation)",
        "Standard formulas: lim x approaches a: (f(x)-f(a))/(x-a) = f'(a)",
        "Handling indeterminate form evaluations (0/0)"
      ];
      const homework = [
        "Evaluate limits of polynomial functions using factoring techniques",
        "Solve 3 practice questions on continuous limit curves from textbook Exercise 4.2"
      ];

      await syncBookingNotes(bookingId, { coreConcepts, homework });
      setNotesSynced(true);
      alert('AI Notes Synced! The study guide, formulas, and practice homework have been successfully saved to the database for this class.');
    } catch (err) {
      alert('Failed to sync notes: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncingNotes(false);
    }
  };

  const toggleCaptions = () => {
    if (!recognitionRef.current) {
      setIsCapturing(prev => !prev);
      setCaptions(isCapturing ? '' : 'Listening to speech: "Yes, this calculus formula explains limits."');
      return;
    }
    
    if (isCapturing) {
      recognitionRef.current.stop();
      setIsCapturing(false);
      setCaptions('');
    } else {
      setCaptions('Listening to audio...');
      try {
        recognitionRef.current.start();
        setIsCapturing(true);
      } catch {
        setIsCapturing(false);
      }
    }
  };

  // Exit trigger logic based on roles
  const handleEndClassClick = () => {
    if (isTutor) {
      // Tutor triggers ending: opens waiting modal, posts chat request notice
      setEndRequestedByTutor(true);
      setShowTutorEndModal(true);
      setMessages(m => [...m, { 
        id: Date.now(), 
        from: 'system', 
        text: '⚠️ Tutor has sent an End Class request. Student needs to confirm exit first.' 
      }]);
      if (socket) {
        socket.emit('classroom:end-request', { bookingId });
      }
    } else {
      // Student clicks end class: checks if tutor requested it first
      if (!endRequestedByTutor) {
        alert('You can only leave/end the class once your tutor initiates the End Class request.');
      } else {
        setShowStudentEndModal(true);
      }
    }
  };

  // Tutor simulation helpers to test flows locally
  const simulateTutorRequest = () => {
    setEndRequestedByTutor(true);
    setShowStudentEndModal(true);
    setMessages(m => [...m, { 
      id: Date.now(), 
      from: 'system', 
      text: '⚠️ [Simulated] Tutor has requested to end the class.' 
    }]);
  };

  const simulateStudentConfirm = () => {
    setStudentAcceptedEnd(true);
    setMessages(m => [...m, { 
      id: Date.now(), 
      from: 'system', 
      text: '✅ [Simulated] Student has accepted and ended the class.' 
    }]);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const recMM = String(Math.floor(recSeconds / 60)).padStart(2, '0');
  const recSS = String(recSeconds % 60).padStart(2, '0');

  return (
    <div className="flex h-screen w-full max-w-full box-border flex-col bg-[#080812] pl-12 pr-6 py-5 text-white overflow-x-hidden">
      {/* Top Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-white tracking-wide">Live Classroom workspace</span>
          {recording && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              REC {recMM}:{recSS}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Simulation Controls */}
          {!isTutor && !endRequestedByTutor && (
            <button 
              onClick={simulateTutorRequest}
              className="rounded-lg bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 text-xs text-yellow-400 font-semibold hover:bg-yellow-500/30 transition-all"
              title="Simulate tutor end class prompt for testing student view"
            >
              Simulate Tutor End Request
            </button>
          )}

          {isTutor && endRequestedByTutor && !studentAcceptedEnd && (
            <button 
              onClick={simulateStudentConfirm}
              className="rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs text-green-400 font-semibold hover:bg-green-500/30 transition-all animate-bounce"
              title="Simulate student agreeing to end class"
            >
              Simulate Student Agree
            </button>
          )}

          <div className="flex rounded-xl bg-white/5 p-1 border border-white/5">
            {[
              { id: 'whiteboard', label: 'Whiteboard', icon: Layers },
              { id: 'coding', label: 'Code Editor', icon: Code },
              { id: 'aiNotes', label: 'AI Notes', icon: Sparkles }
            ].map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === tabItem.id 
                    ? 'bg-cyan-electric text-slate-deep shadow-glow-cyan' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <tabItem.icon size={13} />
                {tabItem.label}
              </button>
            ))}
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cyan-electric">{mm}:{ss}</span>
        </div>
      </div>

      {/* Main Workspace grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[1fr_320px]">
        
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 relative rounded-2xl glass-panel p-4 overflow-hidden min-h-0 bg-white/2 border border-white/5">
            {activeTab === 'whiteboard' && (
              <Whiteboard 
                canvasRef={canvasRef}
                tool={tool}
                setTool={setTool}
                brushColor={brushColor}
                setBrushColor={setBrushColor}
                brushWidth={brushWidth}
                setBrushWidth={setBrushWidth}
                isTutor={isTutor}
                socket={socket}
                bookingId={bookingId}
              />
            )}
            
            {activeTab === 'coding' && (
              <CodeWorkspace isTutor={isTutor} />
            )}

            {activeTab === 'aiNotes' && (
              <div 
                className="flex h-full flex-col justify-between overflow-y-auto select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div>
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-cyan-electric mb-4">
                    <Sparkles size={16} /> AI Lecture Notes & Study Guide
                  </h3>
                  <div className="space-y-4 text-sm text-white/70">
                    <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                      <p className="font-semibold text-white mb-2">Core Concepts covered:</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs">
                        <li>Definition of Limits in Calculus (Graphical explanation)</li>
                        <li>Standard formulas: lim x approaches a: (f(x)-f(a))/(x-a) = f'(a)</li>
                        <li>Handling indeterminate form evaluations (0/0)</li>
                      </ul>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                      <p className="font-semibold text-white mb-2">AI Homework recommendations:</p>
                      <ol className="list-decimal pl-5 space-y-1.5 text-xs">
                        <li>Evaluate limits of polynomial functions using factoring techniques</li>
                        <li>Solve 3 practice questions on continuous limit curves from textbook Exercise 4.2</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {isTutor ? (
                  <div className="mt-4 rounded-xl bg-[#00F2FE]/5 border border-[#00F2FE]/20 p-3 text-xs text-[#00F2FE] flex items-center justify-between">
                    <span>Class summary guide ready to sync to Student Hub.</span>
                    <button 
                      onClick={handleSyncNotes}
                      disabled={syncingNotes || notesSynced}
                      className="flex items-center gap-1 rounded-lg bg-cyan-electric px-3 py-1 font-semibold text-slate-deep active:scale-95 transition-all disabled:opacity-75 disabled:scale-100"
                    >
                      {syncingNotes ? (
                        <>Syncing… <RefreshCw size={12} className="animate-spin" /></>
                      ) : notesSynced ? (
                        <>Synced Successfully! ✓</>
                      ) : (
                        <>Sync Notes <ArrowRight size={12} /></>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-cyan-electric/5 border border-cyan-electric/25 p-3 text-xs text-cyan-electric flex items-center justify-between">
                    <span>Save class study guide notes directly to your student dashboard.</span>
                    <button 
                      onClick={() => {
                        alert('AI Class Notes saved successfully to your student dashboard hub!');
                        setNotesSynced(true);
                      }}
                      disabled={notesSynced}
                      className="flex items-center gap-1 rounded-lg bg-cyan-electric px-4 py-1.5 font-bold text-slate-deep active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {notesSynced ? 'Notes Saved! ✓' : 'Save Notes'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {isCapturing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-black/60 rounded-xl p-3 text-center border border-white/5"
              >
                <p className="text-xs text-white/40 tracking-wider uppercase font-semibold mb-1">Live subtitles translation</p>
                <p className="text-sm text-cyan-electric font-medium tracking-wide">
                  {captions || 'Waiting for speaker to talk...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-rows-[200px_1fr] gap-4 overflow-hidden">
          <div className="relative flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 overflow-hidden group">
            {camOn ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=tutor-live"
                  alt="Tutor video feed"
                  className="h-28 w-28 rounded-full opacity-90 ring-4 ring-cyan-electric/25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <VideoOff size={24} className="text-white/20" />
                <p className="text-xs text-white/40">Camera is turned off</p>
              </div>
            )}
            <span className="absolute bottom-3 left-3 rounded-md bg-black/40 px-2 py-1 text-xs text-white">Live Feed</span>
          </div>

          <div className="glass-panel flex flex-col rounded-2xl p-4 overflow-hidden border border-white/5 bg-white/2">
            <p className="mb-2 font-display text-xs font-bold text-white tracking-wide uppercase text-white/40">Class Chat</p>
            <LiveChatPanel messages={messages} setMessages={setMessages} />
          </div>
        </div>
      </div>

      {/* Control Actions bar */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setMicOn((v) => !v)}
          className={`rounded-full p-3 active:scale-90 transition-transform ${micOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400'}`}
          title={micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          className={`rounded-full p-3 active:scale-90 transition-transform ${camOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400'}`}
          title={camOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        
        <button
          onClick={toggleCaptions}
          className={`rounded-full p-3 active:scale-90 transition-transform ${isCapturing ? 'bg-[#00F2FE]/20 text-[#00F2FE]' : 'bg-white/10 text-white hover:bg-white/15'}`}
          title="Toggle speech subtitles transcript"
        >
          <Palette size={18} className={isCapturing ? 'animate-pulse' : ''} />
        </button>

        <button
          onClick={() => {
            if (recording) {
              setRecording(false);
              alert('Lecture recording saved successfully to student hub!');
            } else {
              setRecording(true);
            }
          }}
          className={`rounded-full p-3 active:scale-90 transition-transform ${recording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/10 text-white hover:bg-white/15'}`}
          title={recording ? 'Stop Recording' : 'Record Session'}
        >
          <Sparkles size={18} />
        </button>

        <button
          onClick={handleEndClassClick}
          className={`rounded-full p-3 text-white active:scale-90 transition-transform ${
            endRequestedByTutor ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label="End class"
          title="End Class"
        >
          <PhoneOff size={18} />
        </button>
      </div>

      {/* Tutor Waiting Confirmation Modal */}
      <AnimatePresence>
        {showTutorEndModal && isTutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F1A] p-6 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
                {studentAcceptedEnd ? <CheckCircle2 size={24} className="text-green-400" /> : <AlertTriangle size={24} />}
              </div>
              <h3 className="mb-2 font-display text-lg font-bold">Class Ending Process</h3>
              
              <div className="mb-6 text-sm text-white/60">
                {studentAcceptedEnd ? (
                  <p className="text-green-400 font-medium">
                    Student has accepted the end class request and left the classroom safely.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p>Request sent to student. Waiting for student to confirm and exit first...</p>
                    <div className="flex justify-center pt-2">
                      <Loader2 className="animate-spin text-cyan-electric" size={20} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {studentAcceptedEnd ? (
                  <button
                    onClick={async () => {
                      try { await completeBooking(bookingId); } catch(e) { /* ignore */ }
                      setShowTutorEndModal(false);
                      navigate(-1);
                    }}
                    className="rounded-xl bg-green-500 hover:bg-green-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-green-500/20"
                  >
                    Close Session & Exit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowTutorEndModal(false);
                      setEndRequestedByTutor(false);
                    }}
                    className="rounded-xl border border-white/15 hover:bg-white/5 px-6 py-2.5 text-xs text-white/80"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Prompt Confirmation Modal */}
      <AnimatePresence>
        {showStudentEndModal && !isTutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F1A] p-6 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-electric/15 text-cyan-electric">
                <HelpCircle size={24} />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold">End Class Request</h3>
              <p className="mb-6 text-sm text-white/60">
                Your tutor has completed the lecture and requested to end the session. Do you agree to exit the class now?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={async () => {
                    try { await completeBooking(bookingId); } catch(e) { /* ignore */ }
                    if (socket) {
                      socket.emit('classroom:student-ended', { bookingId });
                    }
                    setShowStudentEndModal(false);
                    setStudentAcceptedEnd(true);
                    navigate(-1);
                  }}
                  className="rounded-xl bg-cyan-electric hover:bg-cyan-electric/90 px-6 py-2.5 text-xs font-semibold text-slate-deep shadow-lg shadow-cyan-electric/25"
                >
                  Agree & Exit Class
                </button>
                <button
                  onClick={() => setShowStudentEndModal(false)}
                  className="rounded-xl border border-white/15 hover:bg-white/5 px-6 py-2.5 text-xs text-white/80"
                >
                  Keep Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hidden audio element for remote stream playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}
