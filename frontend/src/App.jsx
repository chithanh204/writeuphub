import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Subscriptions from './pages/Subscriptions';
import Activity from './pages/Activity';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import EditPost from './pages/EditPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path='/activity' element={<Activity />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/edit-post/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;