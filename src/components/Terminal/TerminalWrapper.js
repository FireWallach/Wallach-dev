import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import './TerminalWrapper.css'
import Art from '../../resources/Art';

function TerminalWrapper(props) {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    let currentEntry = '';

    function terminalPaint(artSpec) {
        const fullArt = artSpec.art;
        const lineSize = artSpec.lineSize;
        for (var i = 0; i <= Math.floor(fullArt.length / lineSize); i++) {
            terminal.current.writeln(fullArt.substring(i * lineSize, (i + 1) * lineSize));
        }
    }

    function initTerminalText() {
        terminalPaint(Art.name);
    }

    useEffect(() => {
        if (terminalRef.current && !terminal.current) {
            terminal.current = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#000000',
                    foreground: '#33ff00'
                }
            });

            const fitAddon = new FitAddon();
            terminal.current.loadAddon(fitAddon);
            terminal.current.open(terminalRef.current);
            fitAddon.fit();
            terminal.current.focus();

            initTerminalText();

            // Command Handling
            terminal.current.onData(data => {
                if (data === '\r') {  // Enter key
                    // Assume the command is whatever was typed before pressing enter
                    // You might need a more robust way to track the input
                    const command = currentEntry;
                    terminal.current.writeln(':');
                    switch (command) {
                        case 'aboutMe':
                            terminal.current.writeln('Displaying about me...');
                            break;
                        case 'resume':
                            terminal.current.writeln('Displaying resume...');
                            break;
                        case 'clear':
                            terminal.current.reset();
                            initTerminalText();
                            break;
                        default:
                            terminal.current.writeln('Unknown command');
                    }

                    currentEntry = '';
                } else if (data === '\x7f') {
                    if (currentEntry.length) {
                        currentEntry = currentEntry.substring(0, currentEntry.length - 1);
                        terminal.current.write('\b \b');
                    }
                } else {
                    // Echo the input data back to the terminal
                    terminal.current.write(data);
                    currentEntry += data;
                }
            });

        }
    }, []);

    return (
        <div ref={terminalRef} className='terminal-wrapper' />
    );
}

export default TerminalWrapper;
