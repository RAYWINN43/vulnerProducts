import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Header() {
  return (
    <header style={{
      background: '#333',
      color: 'white',
      padding: '1rem 2rem',
      marginBottom: '2rem'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h1 style={{ margin: 0 }}>🛒 VulnShop</h1>
      </Link>
    </header>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setLoading(false);
    }
  };

    const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
    setSearchResults([]);
    return;
  }

  const forbidden = ['INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'TRUNCATE','UNION'];
  const cleanQuery = searchQuery.replace(/[^a-zA-Z0-9\s]/g, ''); 

  const upperQuery = cleanQuery.toUpperCase();
  if (forbidden.some(cmd => upperQuery.includes(cmd))) {
    alert('ce sont des mots interdit veuillez changer');
    return;
  }

  setSearching(true);
  try {
    const response = await axios.get(`http://localhost:8000/products/search?q=${encodeURIComponent(cleanQuery)}`);
    setSearchResults(response.data);
    setSearching(false);
  } catch (err) {
    console.error('Search error:', err);
    alert('Search failed: ' + err.message);
    setSearching(false);
  }
};


  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const displayProducts = searchResults.length > 0 || searchQuery ? searchResults : products;
  const isSearchActive = searchQuery.trim().length > 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 1rem' 
    }}>
      {/* Search Bar */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search products by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: '4px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <button 
            type="submit" 
            disabled={searching}
            style={{
              padding: '0.75rem 2rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              opacity: searching ? 0.6 : 1
            }}
            onMouseOver={(e) => e.target.style.background = '#45a049'}
            onMouseOut={(e) => e.target.style.background = '#4CAF50'}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
          {isSearchActive && (
            <button 
              type="button"
              onClick={clearSearch}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#555'}
              onMouseOut={(e) => e.target.style.background = '#666'}
            >
              Clear
            </button>
          )}
        </form>

      </div>

      {/* Results Summary */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2>
          {isSearchActive 
            ? `Search Results (${displayProducts.length})` 
            : `All Products (${products.length})`}
        </h2>
        {isSearchActive && (
          <span style={{ color: '#666', fontSize: '0.9rem' }}>
            Searching for: <strong>"{searchQuery}"</strong>
          </span>
        )}
      </div>

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>No products found</h3>
          <p>Try a different search term or clear your search</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const isUserData = product.username !== undefined;

  if (isUserData) {
    return (
      <div style={{
        background: '#ffebee',
        border: '2px solid #f44336',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          color: '#d32f2f',
          marginBottom: '1rem',
          fontSize: '1.1rem'
        }}>
          ⚠️ EXPOSED USER DATA
        </h3>
        <div style={{ fontSize: '0.9rem' }}>
          <p><strong>ID:</strong> {product.id}</p>
          <p><strong>Username:</strong> {product.username || product.name}</p>
          <p><strong>Email:</strong> {product.email || product.description}</p>
          <p style={{ color: '#d32f2f' }}>
            <strong>Password:</strong> {product.password || product.price}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}>
      <img 
        src={product.image}
        alt={product.name || product.title}
        style={{
          width: '100%',
          height: '250px',
          objectFit: 'contain',
          marginBottom: '1rem',
          background: '#f9f9f9',
          padding: '1rem',
          borderRadius: '4px'
        }}
      />
      
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '1rem', 
          marginBottom: '0.5rem',
          minHeight: '3rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name || product.title}
        </h3>
        
        <p style={{
          color: '#666',
          fontSize: '0.9rem',
          marginBottom: '0.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#4CAF50'
          }}>
            ${product.price}
          </span>
          
          {product.rating_rate && (
            <span style={{
              fontSize: '0.9rem',
              color: '#666'
            }}>
              ⭐ {product.rating_rate} ({product.rating_count})
            </span>
          )}
        </div>
        
        {product.category && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: '#999',
            textTransform: 'uppercase'
          }}>
            {product.category}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
    loadComments();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading product:', err);
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}/comments`);
      setComments(response.data);
      console.log(response.data);
      
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

const handleSubmitComment = async (e) => {
  e.preventDefault();
  if (!newComment.trim()) return;

  const demoUserId = 1;
  
  const structuredPayload = `${demoUserId}|ID_SPLIT|${newComment}`; 

  setSubmitting(true);
  try {
    await axios.post(`http://localhost:8000/products/${id}/comments`, structuredPayload, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    setNewComment('');
    loadComments();
    setSubmitting(false);
  } catch (err) {
    console.error('Error posting comment:', err);
    alert('Failed to post comment: ' + err.message);
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')} style={buttonStyle}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <button 
        onClick={() => navigate('/')}
        style={{
          ...buttonStyle,
          background: '#666',
          marginBottom: '1rem'
        }}
      >
        ← Back to Products
      </button>

      {/* Product Details */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <img 
            src={product.image}
            alt={product.name || product.title}
            style={{
              width: '400px',
              height: '400px',
              objectFit: 'contain',
              background: '#f9f9f9',
              padding: '2rem',
              borderRadius: '8px'
            }}
          />
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ marginTop: 0 }}>{product.name || product.title}</h1>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {product.description}
            </p>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#4CAF50',
              margin: '1rem 0'
            }}>
              ${product.price}
            </div>
            {product.rating_rate && (
              <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
                ⭐ {product.rating_rate} / 5 ({product.rating_count} reviews)
              </div>
            )}
            {product.category && (
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#e0e0e0',
                borderRadius: '20px',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                {product.category}
              </div>
            )}
            <div>
              <button style={{
                ...buttonStyle,
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>Customer Reviews ({comments.length})</h2>



        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} style={{ marginBottom: '2rem' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your review here... "
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '1rem'
            }}
          />
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              ...buttonStyle,
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>

        {/* Comments List */}
        <div>
          {comments.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  borderBottom: '1px solid #eee',
                  padding: '1.5rem 0'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <strong style={{ fontSize: '1.1rem' }}>{comment.username}</strong>
                  <span style={{ color: '#999', fontSize: '0.9rem' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* VULNERABLE: Rendering unsanitized HTML - XSS */}
                <div 
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                  style={{ lineHeight: '1.6', color: '#333' }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.2s'
};

export default App;