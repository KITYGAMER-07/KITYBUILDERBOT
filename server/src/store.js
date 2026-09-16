import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data.json');

const initialData = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botInfo: null,
  channels: [
    {
      id: '-1002003004001',
      title: 'Demo Announcements Channel',
      username: 'demo_channel',
      type: 'channel',
      addedAt: new Date().toISOString(),
      permissions: {
        can_post_messages: true,
        can_edit_messages: true,
        can_delete_messages: true
      }
    }
  ],
  templates: [
    {
      id: 'template_product_launch',
      name: '🚀 Product Launch Announcement',
      category: 'Marketing',
      createdAt: new Date().toISOString(),
      blocks: [
        {
          id: 'b1',
          type: 'heading',
          level: 1,
          text: '🚀 Introducing NovaEsp Pro 2.0'
        },
        {
          id: 'b2',
          type: 'paragraph',
          text: 'We are thrilled to unveil our biggest release yet! Built from the ground up for high-performance automation.'
        },
        {
          id: 'b3',
          type: 'slideshow',
          items: [
            { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', caption: 'Intuitive Dashboard UI' },
            { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', caption: 'Real-time Analytics & Stats' },
            { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', caption: 'Next-gen Security & API' }
          ]
        },
        {
          id: 'b4',
          type: 'heading',
          level: 2,
          text: '✨ Core Specifications & Benchmarks'
        },
        {
          id: 'b5',
          type: 'table',
          headers: ['Feature', 'NovaEsp Pro', 'Industry Avg'],
          rows: [
            ['Speed / Latency', '⚡ < 12ms', '🐢 ~140ms'],
            ['Max Concurrency', '🔥 50,000 req/s', '1,500 req/s'],
            ['Rich Message API', '✅ Full Suite', '❌ Plain Only']
          ]
        },
        {
          id: 'b6',
          type: 'details',
          title: '📖 Click to Read Full Release Notes & Architecture',
          content: 'NovaEsp Pro 2.0 leverages distributed worker microservices, zero-copy serialization, and instant edge webhook synchronization for guaranteed 99.99% uptime.'
        },
        {
          id: 'b7',
          type: 'math',
          expression: '\\text{Speedup} = \\frac{T_{\\text{old}}}{T_{\\text{new}}} = \\lim_{N \\to \\infty} \\sum_{k=1}^{N} \\frac{1}{k^2} = \\frac{\\pi^2}{6} \\approx 1.6449\\times'
        },
        {
          id: 'b8',
          type: 'code',
          language: 'javascript',
          code: '// Quick Start in Node.js\nimport { NovaClient } from "@novasp/sdk";\n\nconst client = new NovaClient({ apiKey: "nova_live_89a3f" });\nconst res = await client.channels.publish({\n  channelId: "@demo_channel",\n  richMessage: { title: "Hello Telegram" }\n});'
        },
        {
          id: 'b9',
          type: 'list',
          listType: 'bullet',
          items: [
            'Instant 1-click Channel Deployment',
            'Full support for Tables, Math & Slideshows',
            'Built-in Telegram Mini App Editor'
          ]
        },
        {
          id: 'b10',
          type: 'buttons',
          buttons: [
            [
              { text: '🌐 Visit Website', type: 'url', url: 'https://example.com' },
              { text: '📱 Open Mini App', type: 'webapp', url: 'https://example.com/app' }
            ],
            [
              { text: '📋 Copy Promo Code: NOVA2026', type: 'copy_text', text: 'NOVA2026' }
            ]
          ]
        },
        {
          id: 'b11',
          type: 'footer',
          text: '© 2026 NovaEsp Automate. Built with Telegram Bot API 10.x. All rights reserved.'
        }
      ]
    }
  ]
};

class Store {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return { ...initialData, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Error reading data file, using default data:', e);
    }
    this.save(initialData);
    return initialData;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing data file:', e);
    }
  }

  getBotToken() {
    return this.data.botToken || process.env.TELEGRAM_BOT_TOKEN || '';
  }

  setBotToken(token) {
    this.data.botToken = token;
    this.save();
  }

  getBotInfo() {
    return this.data.botInfo;
  }

  setBotInfo(info) {
    this.data.botInfo = info;
    this.save();
  }

  getChannels() {
    return this.data.channels || [];
  }

  addOrUpdateChannel(channel) {
    const existingIndex = this.data.channels.findIndex(c => String(c.id) === String(channel.id));
    if (existingIndex >= 0) {
      this.data.channels[existingIndex] = {
        ...this.data.channels[existingIndex],
        ...channel,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.data.channels.push({
        ...channel,
        addedAt: new Date().toISOString()
      });
    }
    this.save();
  }

  removeChannel(id) {
    this.data.channels = this.data.channels.filter(c => String(c.id) !== String(id));
    this.save();
  }

  getTemplates() {
    return this.data.templates || [];
  }

  saveTemplate(template) {
    const existingIndex = this.data.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      this.data.templates[existingIndex] = {
        ...this.data.templates[existingIndex],
        ...template,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.data.templates.push({
        ...template,
        id: template.id || `tpl_${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
    return template;
  }

  deleteTemplate(id) {
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    this.save();
  }
}

export const store = new Store();
