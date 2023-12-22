import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import './TerminalWrapper.css'
import Art from '../../resources/Art';
import BioLines from '../../resources/Bio';

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
        terminal.current.writeln('Github')
        if (showExplanations) terminal.current.writeln('Opens Dylan\'s GitHub in another tab');
        terminal.current.writeln('AboutMe');
        if (showExplanations) terminal.current.writeln('Prints a quick bio about the developer');
        terminal.current.writeln('Resume');
        if (showExplanations) terminal.current.writeln('Links to developer\'s resume');
        terminal.current.writeln('Clear');
        if (showExplanations) terminal.current.writeln('Clears the terminal');
        terminal.current.writeln('Help');
        if (showExplanations) terminal.current.writeln('Displays Commands');
    }

    function printAboutMe() {
        BioLines.forEach(line => {
            // Center each line by adding spaces (adjust the number as needed)
            const paddedLine = line.padStart((80 + line.length) / 2).padEnd(80);
            terminal.current.writeln(paddedLine);
        });
    }

    const downloadResume = () => {
        const link = document.createElement('a');
        link.href = 'https://drive.google.com/uc?export=download&id=1RZtXUxDZ-qvypUNOWVPjovz1Zsl4gMfk';
        link.download = 'Dylan-Wallach.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    function printPrompt() {
        terminal.current.write('$ ');
    }


    function openGitHubWithMessage() {
        let message = "Opening Dylan's GitHub in another tab";
        let count = 0;

        terminal.current.write(message); // Write the initial message

        const intervalId = setInterval(() => {
            if (count < 3) {
                terminal.current.write('.');
                count++;
            } else {
                clearInterval(intervalId);
                window.open('https://github.com/firewallach', '_blank');

                setTimeout(() => {
                    terminal.current.writeln('\r\nSuccess! (If your browser blocked pop-ups, you can find it here: https://github.com/firewallach)');
                    printPrompt();
                }, 100);
            }
        }, 250);
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

    function initTerminalText(didClear = false) {
        terminalPaint(Art.name);
        terminalPaint(Art.face);
        printHelpText();
        terminal.current.write('\n');
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
            terminal.current.write('$')

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
                            printAboutMe();
                            printPrompt();
                            break;
                        case 'resume':
                            terminal.current.writeln('Downloading Resume...');
                            downloadResume();
                            printPrompt();
                            break;
                        case 'clear':
                            terminal.current.reset();
                            initTerminalText();
                            printPrompt();
                            break;
                        case 'github':
                            openGitHubWithMessage();
                            break;
                        case 'help':
                            printHelpText(true);
                            printPrompt();
                            break;
                        default:
                            terminal.current.writeln('Unknown command - type \'help\' for commands list');
                    }

                    currentEntry.current = '';
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
