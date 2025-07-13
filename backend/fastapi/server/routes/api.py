import requests 
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from dateutil.relativedelta import relativedelta
from server.utils.solution import generate_safety_advice
import uuid

router = APIRouter(prefix="/api")

NEWSAPI_KEY = "acf3df4c285941829a60fa483e084105"
KEYWORDS = ['attack', 'violence', 'theft', 'shooting', 'assault', 'kidnap', 'fire', 'riot', 'accident', 'flood', 'earthquake']

def fetch_news(city: str):
    one_month_ago = datetime.now() - relativedelta(months=1)
    from_date = one_month_ago.strftime('%Y-%m-%d')
    query = f"{city} {' OR '.join(KEYWORDS)}"
    url = (
        f'https://newsapi.org/v2/everything?'
        f'q={query}&'
        f'from={from_date}&'
        'sortBy=publishedAt&'
        'language=en&'
        'pageSize=20&'
        f'apiKey={NEWSAPI_KEY}'
    )
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('articles', [])
    else:
        print("Failed to fetch news:", response.status_code)
        return []

def categorize_threat(title: str, description: str) -> tuple:
    """Categorize threat based on keywords and return category and level"""
    text = f"{title} {description}".lower()
    
    # Crime-related keywords
    crime_keywords = ['theft', 'robbery', 'murder', 'assault', 'kidnap', 'crime', 'police', 'arrest']
    # Natural disaster keywords
    natural_keywords = ['flood', 'earthquake', 'cyclone', 'storm', 'landslide', 'drought']
    # Traffic keywords
    traffic_keywords = ['accident', 'traffic', 'collision', 'road', 'highway', 'vehicle']
    # Riot keywords
    riot_keywords = ['riot', 'protest', 'violence', 'clash', 'unrest']
    # Fire keywords
    fire_keywords = ['fire', 'explosion', 'blast', 'burn']
    # Medical keywords
    medical_keywords = ['disease', 'outbreak', 'virus', 'pandemic', 'health']
    
    category = 'other'
    if any(keyword in text for keyword in crime_keywords):
        category = 'crime'
    elif any(keyword in text for keyword in natural_keywords):
        category = 'natural'
    elif any(keyword in text for keyword in traffic_keywords):
        category = 'traffic'
    elif any(keyword in text for keyword in riot_keywords):
        category = 'riot'
    elif any(keyword in text for keyword in fire_keywords):
        category = 'fire'
    elif any(keyword in text for keyword in medical_keywords):
        category = 'medical'
    
    # Determine threat level based on severity keywords
    high_severity = ['murder', 'explosion', 'earthquake', 'flood', 'riot', 'fire', 'kidnap']
    medium_severity = ['theft', 'accident', 'protest', 'storm', 'clash']
    
    level = 'low'
    if any(keyword in text for keyword in high_severity):
        level = 'high'
    elif any(keyword in text for keyword in medium_severity):
        level = 'medium'
    
    return category, level

@router.get("/threats")
async def get_threats(location: str = Query(default="Delhi")):
    try:
        news = fetch_news(location)
        threats = []
        
        for i, article in enumerate(news[:15]):  # Limit to 15 articles
            title = article.get('title', '')
            description = article.get('description', '') or ''
            content = article.get('content', '') or ''
            
            if not title:
                continue
                
            category, level = categorize_threat(title, description)
            
            # Generate AI safety advice
            advice = generate_safety_advice(title, description)
            advice_list = advice.split('\n') if advice else []
            advice_list = [item.strip('- ').strip() for item in advice_list if item.strip()]
            
            # Create threat object matching frontend structure
            threat = {
                "id": i + 1,
                "title": title,
                "location": location,
                "category": category,
                "level": level,
                "timestamp": article.get('publishedAt', datetime.now().isoformat()),
                "summary": description or content[:200] + "..." if content else "No description available",
                "affectedPeople": random.randint(100, 50000),  # Simulated data
                "aiAdvice": advice_list[:5] if advice_list else [
                    "Stay informed about the situation",
                    "Follow local authorities' guidance",
                    "Avoid the affected area if possible"
                ],
                "url": article.get('url', ''),
                "source": article.get('source', {}).get('name', 'Unknown')
            }
            threats.append(threat)
        
        return JSONResponse(content=threats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching threats: {str(e)}")

@router.get("/threats/{threat_id}")
async def get_threat_details(threat_id: int):
    """Get detailed information about a specific threat"""
    try:
        # For now, return mock data. In production, this would fetch from database
        threat_detail = {
            "id": threat_id,
            "title": f"Threat {threat_id} Details",
            "location": "Delhi",
            "category": "crime",
            "level": "medium",
            "timestamp": datetime.now().isoformat(),
            "summary": "Detailed threat information would be fetched from the database",
            "affectedPeople": 1500,
            "aiAdvice": [
                "Stay alert in the area",
                "Avoid traveling alone at night",
                "Keep emergency contacts handy"
            ],
            "trend_data": [3, 5, 4, 7, 6, 4, 2]  # 7-day trend
        }
        return JSONResponse(content=threat_detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching threat details: {str(e)}")