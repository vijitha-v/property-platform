import { redis } from '../config/redis';
import dotenv from 'dotenv';
dotenv.config();

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
const CACHE_TTL = 300;

async function graphqlFetch(query: string) {
  const response = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL error: ${response.statusText}`);
  }

  return response.json();
}

export async function getProperties() {
  try {
    const cacheKey = 'wp:properties';
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('Cache hit: wp:properties');
      return JSON.parse(cached);
    }

    console.log('Cache miss: fetching from WordPress');
    const data = await graphqlFetch(`
      {
        posts(first: 10) {
          nodes {
            id
            title
            slug
            date
            excerpt
          }
        }
      }
    `);

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    return data;

  } catch (error) {
    console.error('WordPress service error:', error);
    throw error;
  }
}

export async function getPropertyBySlug(slug: string) {
  try {
    const cacheKey = `wp:property:${slug}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const data = await graphqlFetch(`
      {
        postBy(slug: "${slug}") {
          id
          title
          slug
          date
          content
          excerpt
        }
      }
    `);

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    return data;

  } catch (error) {
    console.error('WordPress service error:', error);
    throw error;
  }
}

export async function invalidateCache(slug?: string) {
  if (slug) {
    await redis.del(`wp:property:${slug}`);
    console.log(`Cache invalidated: wp:property:${slug}`);
  } else {
    await redis.del('wp:properties');
    console.log('Cache invalidated: wp:properties');
  }
}