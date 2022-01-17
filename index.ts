import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import DoUsername from 'do_username';

Quill.register('modules/cursors', QuillCursors);

const quill = new Quill(document.querySelector('#editor'), {
  modules: {
    cursors: true,
    toolbar: [
      // adding some basic Quill content features
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block'],
    ],
    history: {
      // Local undo shouldn't undo changes
      // from remote users
      userOnly: true,
    },
  },
  placeholder: 'Start collaborating...',
  theme: 'snow', // 'bubble' is also great
});

// A Yjs document holds the shared data
const ydoc = new Y.Doc();

const provider = new WebrtcProvider('quill-demo-awareness-room', ydoc);

// All network providers implement the awareness protocol. You can use it to propagate information about yourself.
const awareness = provider.awareness;

// Define a shared text type on the document
const ytext = ydoc.getText('quill');

// "Bind" the quill editor to a Yjs text type.
// The QuillBinding uses the awareness instance to propagate your cursor location.
debugger;
const binding = new QuillBinding(ytext, quill, awareness);

// (optional) Remove the selection when the iframe is blurred
window.addEventListener('blur', () => {
  quill.blur();
});

// Each user should be associated to a color.
// One approach is to pick a random color from a pool of colors that work well with your project.
export const usercolors = [
  '#30bced',
  '#6eeb83',
  '#ffbc42',
  '#ecd444',
  '#ee6352',
  '#9ac2c9',
  '#8acb88',
  '#1be7ff',
];
const myColor = usercolors[Math.floor(Math.random() * usercolors.length)];

const inputElement: HTMLInputElement = document.querySelector('#username');
// propagate the username from the input element to all users
const setUsername = () => {
  awareness.setLocalStateField('user', {
    name: inputElement.value,
    color: myColor,
  });
};
// observe changes on the input element that contains the username
inputElement.addEventListener('input', setUsername);

// Render a list of usernames next to the editor whenever new information is available from the awareness instance
awareness.on('change', () => {
  // Map each awareness state to a dom-string
  const strings = [];
  awareness.getStates().forEach((state) => {
    console.log(state);
    if (state.user) {
      strings.push(
        `<div style="color:${state.user.color};">• ${state.user.name}</div>`
      );
    }
    document.querySelector('#users').innerHTML = strings.join('');
  });
});

// Set a randomly generated username - this is nice for testing
inputElement.value = DoUsername.generate(15);
setUsername();
