/**
 * HomePage Component
 * Main landing page displaying all approved courses
 */

import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import courseService from '../services/courseService';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (category) filters.category = category;
      if (sortBy) filters.sort = sortBy;

      const response = await courseService.getAllCourses(filters);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Edupress</h1>
          <p>Discover thousands of courses and start learning today!</p>
          <a href="#courses-section" className="hero-cta">
            Explore Courses
          </a>
        </div>
      </section>

      <section className="search-filter-section">
        <div className="search-filter-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              Search
            </button>
          </form>

          <div className="filters">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="">Sort By</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </section>

      <section className="courses-section" id="courses-section">
        <div className="container">
          {error && <Message type="error" message={error} />}

          {loading ? (
            <Loader message="Loading courses..." />
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <h2 className="section-title">
                Available Courses ({courses.length})
              </h2>
              <div className="courses-grid">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
