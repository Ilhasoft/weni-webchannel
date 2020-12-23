# Push Webchat ![npm](https://img.shields.io/npm/v/push-webchat)

A simple webchat widget to connect with Push 💬platform. Originally forked from [rasa-webchat](https://github.com/botfront/rasa-webchat) and [react-chat-widget](https://github.com/Wolox/react-chat-widget) and optimized for [Push](https://push.al).
## Features

- Text Messages
- Quick Replies
- Images and Videos
- Markdown support
- Easy to import in a script tag or as a React Component
- Persistent sessions
- Typing indications
- Smart delay between messages

<img src="./assets/chat-demonstration-push.gif" alt="demonstration" width="400"/>

## Usage

### In a `<script>` tag

In your `<body/>`:
```javascript
<div id="webchat"/>
<script src="https://storage.googleapis.com/push-webchat/widget-latest.js"></script>
// Or you can replace latest with a specific version
<script>
  WebChat.default.init({
    selector: "#webchat",
    initPayload: "Hello",
    channelUuid: '37e3fde9-5a54-4d11-9adc-78629ffaa2e3', // External Channel UUID from Push
    host: 'https://new.push.al', // Host URL from Push
    socketUrl: "https://socket.push.al",
    title: "Title",
    subtitle: "Subtitle",
  })
</script>
```

About images: `width` and `height` define the size in pixels that images in messages are crop-scaled to. If not present, the image will scale to the maximum width of the container and the image.

It is recommended to use a particular version (i.e. "widget-<version>.js") however the file "widget-latest.js"
is also available and is updated continuously with the latest version.

### As a React component

Install the package from GitHub by running:
```bash
npm install push-webchat
```

Then once it is installed it can be implemented as follows.

```javascript
import { Widget } from 'push-webchat';

function CustomWidget = () => {
  return (
    <Widget
      initPayload={"/get_started"}
      socketUrl={"https://socket.push.al"}
      title={"Title"}
    />
  )
}
```

- Make sure to have the prop `embedded`
set to `true` if you don't want to see the launcher.


## Parameters
| Prop / Param                 | Default value          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `initPayload`          | `null`             | Payload sent to Push when conversation starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `socketUrl`            | `null`             | Socket URL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `sessionId` | `null` | If provided, this will be the socket session Id, if not, the socket connection will provide a random one.|
| `customData`           | `null`             | Arbitrary object sent with the socket. It's not supported by Push at the moment.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `docViewer`            | `false`            | If you add this prop to the component or to the init script, `docViewer=true` , this will treat links in received messages as links to a document ( `.pdf .doc .xlsx` etc. ) and will open them in a popup using `https://docs.google.com/viewer` service                                                                                                                                                                                                                                                                    |
| `title`                | `'Welcome"`        | Title shown in the header of the widget                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `subtitle`             | `null`             | Subtitle shown under the title in the header of the widget                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `inputTextFieldHint`   | `"Type a message"` | User message input field placeholder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `hideWhenNotConnected` | `true`             | If `true` the widget will hide when the connection to the socket is lost                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `connectOn`            | `"mount"`          | This prop lets you choose when the widget will try connecting to the server. By default, it tries connecting as soon as it mounts. If you select `connectOn='open'` it will only attempt connection when the widget is opened. it can only take the values `mount` and `open`.                                                                                                                                                                                                                                               |
| `onSocketEvent`        | `null`             | call custom code on a specific socket event                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `embedded`             | `false`            | Set to `true` if you want to embed the in a web page. The widget will always be open and the `initPayload` will be triggered immediately                                                                                                                                                                                                                                                                                                                                                                                     |
| `showFullScreenButton` | `false`            | Show a full screen toggle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `displayUnreadCount`   | `false`            | Path to an image displayed on the launcher when the widget is closed                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `showMessageDate`      | `false`            | Show message date. Can be overriden with a function: `(timestamp, message) => return 'my custom date'`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `customMessageDelay`   | See below          | This prop is a function, the function take a message string as an argument. The defined function will be called everytime a message is received and the returned value will be used as a milliseconds delay before displaying a new message.                                                                                                                                                                                                                                                                                 |
| `params`               | See below          | Essentially used to customize the image size.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `storage`              | `"local"`          | Specifies the storage location of the conversation state in the browser. `"session"` defines the state to be stored in the session storage. The session storage persists on reload of the page, and is cleared after the browser or tab is closed, or when `sessionStorage.clear()`is called. `"local"` defines the state to be stored in the local stoage. The local storage persists after the the browser is closed, and is cleared when the cookies of the browser are cleared, or when `localStorage.clear()`is called. |
| `customComponent`      | `null`             | Custom component to be used with custom responses. E.g.: `customComponent={ (messageData) => (<div>Custom React component</div>)` }   |
| `onWidgetEvent`        | `{}`             | call custom code on a specific widget event ( onChatOpen, onChatClose, onChatHidden, are available for now ), add a function to the desired object property in the props to have it react to the event. |
| `customizeWidget` | See below | Specifies a set of custom css parameters for the widget style |
| `handleNewUserMessage` | `null` | Call a custom function when the user send a new message |
| `profileAvatar` | `null` | Image to be displayed on chat Header and with a bot message |
| `openLauncherImage` | `null` | Image to be displayed on the Launcher while the chat is closed |
| `closeImage` | `null` | Image to be displayed on the Launcher while the chat is open |
| `connectingText` | `'Waiting for server...'` | Message displayed while the connection between the widget and socket server is established |
| `showCloseButton` | `true` | Boolean to define if the close button will be shown |
| `startFullScreen` | `false` | Boolean to define if the widget is started on fullscreen mode |
| `tooltipMessage` | `null` | Message that will be displayed as tooltip |
| `tooltipDelay` | `500` | Delay for the `tooltipMessage` |
| `disableTooltips` | `false` | Boolean to define if tooltips should be displayed |
| `showHeaderAvatar` | `true` | Boolean to define if the image provided in `profileAvatar` attribute must be displayed in Header |
| `headerImage` | `null` | If provided, the image will be displayed in place of `profileImage`, `title` and `subtitle` |
| `suggestionsConfig` | See below | Prop to define the configuration for the source of input suggestions data |
| `customAutoComplete` | See below | This prop is a function, the function take the current input string as an argument. The defined function will be called everytime the user modify the input within a delay of 500ms, the function return must be an array of strings that will be used as input suggestions. |



### Additional Examples

##### `customMessageDelay`
```javascript
(message) => {
    let delay = message.length * 30;
    if (delay > 2 * 1000) delay = 3 * 1000;
    if (delay < 400) delay = 1000;
    return delay;
}
```

##### `customAutoComplete`
```javascript
(currentInput) => {
    // you can gather strings in any manner to use as input suggestions
    return ['first message', 'second message', 'third message', 'fourth message', 'fifth message'];
}
```

##### `onSocketEvent`
```jsx
onSocketEvent={{
  'connect': () => console.log('connection established'),
  'disconnect': () => doSomeCleanup(),
}}
```

##### `params`

The `params` props only allows to specify custom image dimensions:
```jsx
params={{
        images: {
          dims: {
            width: 300,
            height: 200
          }
        }
      }}
```

##### `suggestionsConfig`

The `suggestionsConfig` props contains the configuration for the suggestions request made to the given url:

- `url`: The API Url for the requests
- `datasets`: The datasets IDs for the suggestions
- `language`: The language that the suggestions should be returned from the API call
- `excludeIntents`: The intents that should be excluded from the suggestions
- `automaticSend`: If set to true, when the user clicks the suggestion, it will send it automaticaly instead of changing only the input
```jsx
suggestionsConfig = {
    url: 'https://api.bothub.it/v2/repository/examples/search_repositories_examples/',
    datasets: [
      "xxxxxxxx-yyyy-zzzz-wwww-yyyyyyyyyyyy",
      "yyyyyyyy-xxxx-wwww-zzzz-wwwwwwwwwwww",
      "aaaaaaaa-cccc-dddd-bbbb-aaaaaaaaaaaa"
    ],
    language: "en",
    excludeIntents: ['bias'],
    automaticSend: false,
  }
```

##### `Customize the Widget interface`

- All `colors` are specified using predefined [color names](https://www.w3schools.com/colors/colors_names.asp), or RGB, HEX, HSL, RGBA, HSLA values.
- All `dimension` values can be any of the [standard css lenght unit types](https://www.w3schools.com/cssref/css_units.asp).

| Prop / Param                      | Default value   | Type        | Description                                         |
| --------------------------------- | --------------- | ----------- | --------------------------------------------------- |
| `titleColor`                      | `#fff`          | `color`     | Set the widget Title color                          |
| `subtitleColor`                   | `#fff`          | `color`     | Set the widget Subtitle color                       |
| `headerBackgroundColor`           | `#003a9b`       | `color`     | Set the widget Header background-color              |
| `launcherColor`                   | `#003a9b`       | `color`     | Set the widget Launcher color                       |
| `chatBackgroundColor`             | `#fff`          | `color`     | Set the widget Chat background-color                |
| `inputBackgroundColor`            | `#f4f7f9`       | `color`     | Set the widget Input background-color               |
| `inputFontColor`                  | `#000`          | `color`     | Set the widget Input font color                     |
| `inputPlaceholderColor`           | `#b5b5b5`       | `color`     | Set the widget Input placeholder color              |
| `userMessageBubbleColor`          | `#003a9b`       | `color`     | Set the user message bubble color                   |
| `userMessageTextColor`            | `#fff`          | `color`     | Set the user message text color                     |
| `botMessageBubbleColor`           | `#f4f7f9`       | `color`     | Set the bot message bubble color                    |
| `botMessageTextColor`             | `#000`          | `color`     | Set the bot message text color                      |
| `widgetHeight`                    | `65vh`          | `dimension` | Set the widget Height                               |
| `widgetWidth`                     | `370px`         | `dimension` | Set the widget Width                                |
| `launcherHeight`                  | `60px`          | `dimension` | Set the Launcher Height                             |
| `launcherWidth`                   | `60px`          | `dimension` | Set the Launcher Width                              |
| `quickRepliesFontColor`           | `#0084ff`       | `color`     | Set the Quick-Replies font color                    |
| `quickRepliesBackgroundColor`     | `none`          | `color`     | Set the Quick-Replies background-color              |
| `quickRepliesBorderColor`         | `#0084ff`       | `color`     | Set the Quick-Replies border color                  |
| `quickRepliesBorderWidth`         | `1px`           | `dimension` | Set the Quick-Replies border width                  |
| `fullScreenBotMessageBubbleColor` | `rgba(0,0,0,0)` | `color`     | Set the bot message bubble color on fullscreen mode |
| `suggestionsBackgroundColor`      | `#edf1f3`       | `color`     | Set the suggestions container background color      |
| `suggestionsSeparatorColor`       | `#e6e6e6`       | `color`     | Set suggestions line separator color                |
| `suggestionsFontColor`            | `grey`          | `color`     | Set the suggestions font color                      |
| `suggestionsHoverFontColor`       | `#03348a`       | `color`     | Set the suggestions font color                      |

### Other features

#### Tooltip

Text messages received when the widget is closed will be shown as a tooltip.

#### Sending a message on page load

When reconnecting to an existing chat session, the bot will send a message contained in the localStorage key specified by the `NEXT_MESSAGE` constant. The message should be stringified JSON with a `message` property describing the message and an `expiry` property set to a UNIX timestamp in milliseconds after which this message should not be sent. This is useful if you would like your bot to be able to offer your user to navigate around the site.


## API

| Method                                   | Description                                                                                                                                                              |
|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `WebChat.toggle()`                       | Toggle the open/close state of the chat window, send initPayload if webchat is not initialized and is toggled open                                                       |
| `WebChat.open()`                         | Open the chat window, send initPayload if webchat is not initialized                                                                                                     |
| `WebChat.close()`                        | Close the chat window                                                                                                                                                    |
| `WebChat.isOpen()`                       | Get the open/closed state of the widget                                                                                                                                  |
| `WebChat.show()`                         | Show the chat widget, send initPayload if the chat is in open state and not initialized                                                                                  |
| `WebChat.hide()`                         | Hide the chat widget                                                                                                                                                     |
| `WebChat.isVisible()`                    | Get the shown/hidden state of the widget                                                                                                                                 |
| `WebChat.send(payload, text: optionnal)` | send a payload (`/hello` to Push. If `text` is specified, it will be displayed as a user message. If not specified, no user message will be displayed |
| `WebChat.reload()` | Reload the chat widget |
| `WebChat.clear()` | Clear the chat conversation and remove it from storage |

### Backends

The widget can be used with Push socket server. Contact contato@ilhasoft.com.br if you want to use it.


#### Push

The Push Webchat was forked from an open source project [rasa-webchat](https://github.com/botfront/rasa-webchat) team and it works with [Push](https://push.al).

##### Sending messages from the backend to the chat widget

###### sending plain text

```python
emit(session_id, {"text": "hello"})
```

###### sending quick replies

```python
message = {
  "text": "Happy?",
  "quick_replies":[
    {"title":"Yes", "payload":"/affirm"},
    {"title":"No", "payload":"/deny"}
  ]}
emit(session_id, message)
```

###### sending a link Snippet

Admittedly a bit far fetched, thinking that Snippets would evolve to carousels
of generic templates :)

```python
message = {
  "attachment":{
    "type":"template",
    "payload":{
      "template_type":"generic",
      "elements":[
        {
          "title":"Title",
          "buttons":[ {
            "title":"Link name",
            "url": "http://link.url"
          }
        ]
      }
    ]
  }
}
}
emit(session_id, message)
```

###### sending a Video Message

```python
message = {
  "attachment":{
    "type":"video",
    "payload":{
      "title":"Link name",
      "src": "https://www.youtube.com/watch?v=f3EbDbm8XqY"
    }
  }
}
emit(session_id, message)
```

###### sending an Image Message

```python
message = {
      "attachment":{
        "type":"image",
        "payload":{
          "title":"Link name",
          "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_IX5FSDQLrwm9qvuXu_g7R9t_-3yBSycZ8OxpRXvMDaTAeBEW"
        }
      }
    }
emit(session_id, message)
```

###### sending a message with custom data

```python
message = {
      "data":{
        "customField1": 'anything you want',
        "customField2": 'other custom data, 
      }
    }
emit(session_id, message)
```
###### sending a message to be displayed as a tooltip

The prop `tooltipMessage` will define what message should be displayed as a tooltip. 

The prop `tooltipDelay` lets you set a delay before calling the payload. It default to 500ms.

```python
message = {
  "text": "Hi!",
  "metadata":{
    "tooltip": true
   }
 }
emit('bot_uttered', message, room=socket_id)
```


## Styles

hierarchy:
```
.push-conversation-container
  |-- .push-header
        |-- .push-title
        |-- .push-close-function
        |-- .push-loading
  |-- .push-messages-container
        |-- .push-message
              |-- .push-client
              |-- .push-response
        |-- .push-replies
              |-- .push-reply
              |-- .push-response
        |-- .push-snippet
              |-- .push-snippet-title
              |-- .push-snippet-details
              |-- .push-link
        |-- .push-imageFrame
        |-- .push-videoFrame
  |-- .push-sender
        |-- .push-new-message
        |-- .push-send
```

| Class                   |  Description                                                        |
|-------------------------|---------------------------------------------------------------------|
| `.push-widget-container`       | The div containing the chatbox of the default version               |
| `.push-widget-embedded`        | div of the embedded chatbox (using embedded prop)                   |
| `.push-full-screen`            | div of the fullscreen chatbox (using fullScreenMode prop)           |
| `.push-conversation-container` | the parent div containing the header, message-container and sender  |
| `.push-messages-container`     | the central area where the messages appear                          |
| `.push-sender`                 | div of the bottom area which prompts user input                     |
| `.push-new-message`            | the text input element of sender                                    |
| `.push-send`                   | the send icon element of sender                                     |
| `.push-header`                 | div of the top area with the chatbox header                         |
| `.push-title`                  | the title element of the header                                     |
| `.push-close-button`           | the close icon of the header                                        |
| `.push-loading`                | the loading status element of the header                            |
| `.push-message`                | the boxes holding the messages of client and response               |
| `.push-replies`                | the area that gives quick reply options                             |
| `.push-snippet`                | a component for describing links                                    |
| `.push-imageFrame`             | a container for sending images                                      |
| `.push-videoFrame`             | a container for sending video                                       |


## Distributing

If you want to fork this repository to create your own distribution, you can reuse some build files and enable Google Cloudbuild to do so. Just follow these steps:

1. Create a project in Google Cloud Console and follow [these instructions](https://cloud.google.com/cloud-build/docs/quickstart-build#before-you-begin);
2. Once you've connected and selected the right project in your terminal for Google Cloud project, just setup your npm user by running `npm adduser`;
3. Update `package.json` file and `cloudbuild.yaml` with proper name of your app;
4. Once everything is ready, you can just run `gcloud builds submit --config=cloudbuild.yaml --substitutions=TAG_NAME="replace_with_tag_name"`


## Contributors
[@Ilhasoft](https://github.com/Ilhasoft)
[@johncordeiro](https://github.com/johncordeiro)
[@PHLF](https://github.com/phlf)
[@znat](https://github.com/znat)
[@TheoTomalty](https://github.com/TheoTomalty)
[@Hub4IT](https://github.com/Hub4IT)
[@dliuproduction](https://github.com/dliuproduction)
[@MatthieuJnon](https://github.com/MatthieuJnon)
[@mofortin](https://github.com/mofortin)
