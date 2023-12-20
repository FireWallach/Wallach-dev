import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import './TerminalWrapper.css'
import Art from '../../resources/Art';

function TerminalWrapper(props) {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const currentEntry = useRef('');
    const commandHistory = useRef([]);
    const historyIndex = useRef(-1);

    function terminalPaint(artSpec) {
        const fullArt = artSpec.art;
        const lineSize = artSpec.lineSize;
        for (var i = 0; i <= Math.floor(fullArt.length / lineSize); i++) {
            terminal.current.writeln(fullArt.substring(i * lineSize, (i + 1) * lineSize));
        }
    }

    function printHelpText(showExplanations = false) {
        terminal.current.writeln('Existing Commands: \n');
        terminal.current.writeln('aboutMe');
        if (showExplanations) terminal.current.writeln('Prints a quick bio about the developer');
        terminal.current.writeln('resume');
        if (showExplanations) terminal.current.writeln('Links to developer\'s resume');
        terminal.current.writeln('clear');
        if (showExplanations) terminal.current.writeln('clears the terminal');
        terminal.current.writeln('help');
        if (showExplanations) terminal.current.writeln('assists with commands');
    }

    function updateCommandLine() {
        // Clear the current line and set the cursor at the start
        terminal.current.write('\x1b[2K\r$ ');
        terminal.current.write(currentEntry.current);
    }

    function handleArrowKeys(data) {
        if (data === '\u001b[A') {  // Up arrow key
            if (historyIndex.current < commandHistory.current.length - 1) {
                historyIndex.current++;
                currentEntry.current = commandHistory.current[historyIndex.current];
                updateCommandLine();
            }
        } else if (data === '\u001b[B') {  // Down arrow key
            if (historyIndex.current > 0) {
                historyIndex.current--;
                currentEntry.current = commandHistory.current[historyIndex.current];
                updateCommandLine();
            } else if (historyIndex.current === 0) {
                historyIndex.current--;
                currentEntry.current = '';
                updateCommandLine();
            }
        }
    }

    function initTerminalText() {
        terminalPaint(Art.name);
        printHelpText();
        terminal.current.write('\n');
        terminal.current.write('$ ');
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
                    const command = currentEntry.current.toLowerCase();
                    terminal.current.writeln('\n');
                    commandHistory.current.unshift(currentEntry.current);
                    historyIndex.current = -1;

                    // Handle different commands
                    switch (command) {
                        case 'aboutme':
                            terminal.current.writeln('Displaying about me...');
                            break;
                        case 'resume':
                            terminal.current.writeln('Displaying resume...');
                            break;
                        case 'clear':
                            terminal.current.reset();
                            initTerminalText();
                            break;
                        case 'help':
                            printHelpText(true);
                            break;
                        default:
                            terminal.current.writeln('Unknown command - type \'help\' for commands list');
                    }

                    currentEntry.current = '';
                    terminal.current.write('$ ');
                } else if (data === '\x7f') {  // Backspace key
                    if (currentEntry.current.length) {
                        currentEntry.current = currentEntry.current.substring(0, currentEntry.current.length - 1);
                        terminal.current.write('\b \b');
                    }
                } else if (data.startsWith('\u001b[')) {  // Arrow keys
                    handleArrowKeys(data);
                } else {
                    // Echo the input data back to the terminal
                    terminal.current.write(data);
                    currentEntry.current += data;
                }
            });
        }
    }, []);

    return (
        <div ref={terminalRef} className='terminal-wrapper' />
    );
}

export default TerminalWrapper;
