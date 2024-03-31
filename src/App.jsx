import Editor from './Editor';
import image from './image.png'


const App = () => {
  return (
    <div>
      <div className="header">
        <h1>
          <img src={image} loading='lazy' width={40} height={40} alt="Logo" />
          <span>Code Editor</span>
        </h1>
        <span><a href="https://www.instagram.com/carefree_ladka/" target="_blank" rel="noopener noreferrer" className="instagram-link">Made By Pawan</a></span>
      </div>
      <Editor />
    </div>
  )
};

export default App;
