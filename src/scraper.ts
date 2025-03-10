import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getLunchMenu(): Promise<string> {
  try {
    // Replace this URL with the actual webpage URL you want to scrape
    const response = await axios.get(process.env.LUNCH_PAGE_URL!);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Replace this selector with the actual CSS selector for the lunch menu
    // This is just an example - you'll need to adjust based on the actual webpage structure
    const lunchMenu = $('.modal-body').text().trim();
    console.log({lunchMenu});
    if (!lunchMenu) {
      throw new Error('Could not find lunch menu on page');
    }
    
    return lunchMenu;
  } catch (error) {
    console.error('Error scraping lunch menu:', error);
    throw error;
  }
}
