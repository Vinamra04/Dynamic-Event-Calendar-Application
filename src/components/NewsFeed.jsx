import { useState, useEffect } from 'react'

function NewsFeed() {
  const [news, setNews] = useState([])
  const API_KEY = '9f78e4df-6433-493f-a7d7-4ae33c264efc'

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://content.guardianapis.com/search?show-fields=thumbnail&api-key=${API_KEY}&page-size=9`
        )
        const data = await response.json()
        setNews(data.response.results)
      } catch (error) {
        console.error('Error fetching news:', error)
      }
    }

    fetchNews()
  }, [])

  return (
    <div className="images">
      {news.map((item, index) => (
        <a 
          key={item.id} 
          className="image-link" 
          href={item.webUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div 
            className="image" 
            data-label={item.webTitle}
          >
            <img 
              src={item.fields?.thumbnail || 'placeholder-image-url.jpg'} 
              alt={item.webTitle} 
            />
          </div>
        </a>
      ))}
      <a 
        href="https://www.theguardian.com/international"
        target="_blank"
        rel="noopener noreferrer"
        className="more-news"
      >
        More Latest News →
      </a>
    </div>
  )
}

export default NewsFeed 