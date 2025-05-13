import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Layout from './component/Layout';  
import Lisiting from './pages/Listing/Lisiting';
import ProtectedRoute from './ProtectedRoute';
import ItemDetails from './pages/ItemDetails/ItemDetails';
import Search from './pages/Search/Search';
import MessagesPage from './component/MessagePage';
import SellerReview from './component/SellerReview/SellerReview';
function App() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

      
        <Route element={<Layout />}>
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/profile/:studentId" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/listing" element={
            <ProtectedRoute>
              <Lisiting />
            </ProtectedRoute>
          } />
          <Route
            path="/item/:itemId"
            element={
              <ProtectedRoute>
                <ItemDetails />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
          path='/messages/:itemId'
          element={
            <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
          }
          />
          <Route
          path='/messages'
          element={
            <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
          }
          />
          <Route path="/seller-review/:sellerId" 
          element={<ProtectedRoute>
            <SellerReview />
            </ProtectedRoute>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
