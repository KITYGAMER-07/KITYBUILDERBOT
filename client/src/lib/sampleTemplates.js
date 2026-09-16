export const sampleTemplates = [
  {
    id: 'tpl_product_launch',
    name: '🚀 Product Launch & Feature Suite',
    category: 'Product & Tech',
    blocks: [
      {
        id: 'b_head_1',
        type: 'heading',
        level: 1,
        text: '🚀 NovaEsp Automate 2026 Released'
      },
      {
        id: 'b_para_1',
        type: 'paragraph',
        text: 'The most anticipated update of the year is finally here! We built the ultimate automation stack with native Rich Message capabilities.'
      },
      {
        id: 'b_slide_1',
        type: 'slideshow',
        items: [
          { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', caption: '🎨 Interactive Visual Block Studio' },
          { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', caption: '📊 Native Tables & Live Telemetry' },
          { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', caption: '⚡ Distributed High-Speed Execution' }
        ]
      },
      {
        id: 'b_head_2',
        type: 'heading',
        level: 2,
        text: '📊 Performance Benchmarks'
      },
      {
        id: 'b_tbl_1',
        type: 'table',
        headers: ['Metric', 'NovaEsp v2', 'Legacy System'],
        rows: [
          ['Dispatch Latency', '⚡ < 8ms', '🐢 120ms'],
          ['Rich Block Types', '⭐ 18+ Blocks', '❌ 2 Blocks'],
          ['Channel Sync', '✅ Instant Auto', '⚠️ Manual']
        ]
      },
      {
        id: 'b_fold_1',
        type: 'details',
        title: '📖 Click to Expand Architecture Details',
        content: 'Engineered using Node.js, distributed microservices, and Telegram Bot API 10.x endpoints. Capable of processing over 50,000 real-time channel dispatches per minute.'
      },
      {
        id: 'b_math_1',
        type: 'math',
        expression: 'P_{\\text{throughput}} = \\frac{N \\cdot \\mu}{\\sigma^2 + \\epsilon} \\implies \\lim_{t \\to \\infty} \\text{Efficiency} = 99.99\\%'
      },
      {
        id: 'b_code_1',
        type: 'code',
        language: 'javascript',
        code: 'import { NovaClient } from "@novasp/sdk";\n\nconst nova = new NovaClient({ botToken: "BOT_TOKEN" });\nawait nova.sendRichMessage({\n  channelId: "@my_channel",\n  blocks: [ /* tables, slideshows, math */ ]\n});'
      },
      {
        id: 'b_list_1',
        type: 'list',
        listType: 'checklist',
        items: [
          { text: 'Visual Drag & Drop Block Builder', checked: true },
          { text: 'Swipeable Slideshows & Native Tables', checked: true },
          { text: 'Real-time KaTeX LaTeX Math Formulas', checked: true },
          { text: '1-Click Multi-Channel Publishing', checked: true }
        ]
      },
      {
        id: 'b_btn_1',
        type: 'buttons',
        buttons: [
          [
            { text: '🌐 Official Website', type: 'url', url: 'https://telegram.org' },
            { text: '📱 Open Mini App', type: 'webapp', url: 'https://telegram.org' }
          ],
          [
            { text: '📋 Copy Coupon: NOVA2026', type: 'copy_text', text_to_copy: 'NOVA2026' }
          ]
        ]
      },
      {
        id: 'b_footer_1',
        type: 'footer',
        text: '✨ Powered by Telegram Bot API 10.x & NovaEsp Engine. Unsubscribe: @bot'
      }
    ]
  },
  {
    id: 'tpl_crypto_report',
    name: '📈 Financial & Crypto Daily Digest',
    category: 'Finance & Crypto',
    blocks: [
      {
        id: 'b_c_head',
        type: 'heading',
        level: 1,
        text: '📈 Daily Crypto & Market Intel — Morning Brief'
      },
      {
        id: 'b_c_para',
        type: 'paragraph',
        text: 'Global markets opened strong today as institutional volume surged across spot ETFs. Here is your actionable overview.'
      },
      {
        id: 'b_c_tbl',
        type: 'table',
        headers: ['Asset', 'Price (USD)', '24h Change', 'RSI'],
        rows: [
          ['BTC / USDT', '$96,450', '🟢 +4.2%', '68.4'],
          ['ETH / USDT', '$3,820', '🟢 +6.1%', '72.1'],
          ['SOL / USDT', '$245', '🟢 +8.9%', '65.0'],
          ['TON / USDT', '$7.85', '🟢 +12.4%', '78.2']
        ]
      },
      {
        id: 'b_c_pull',
        type: 'pullquote',
        text: 'Bullish momentum accelerates as total DeFi TVL crosses $150 Billion.',
        author: 'Nova Market Analytics'
      },
      {
        id: 'b_c_math',
        type: 'math',
        expression: '\\text{Sharpe Ratio} = \\frac{R_p - R_f}{\\sigma_p} = \\frac{28.4\\% - 4.2\\%}{9.6\\%} = 2.52'
      },
      {
        id: 'b_c_list',
        type: 'list',
        listType: 'bullet',
        items: [
          'Key Resistance level for Bitcoin: $98,500',
          'Support boundary: $93,200',
          'Federal Reserve FOMC minutes scheduled for 18:00 UTC'
        ]
      },
      {
        id: 'b_c_btn',
        type: 'buttons',
        buttons: [
          [
            { text: '📊 Open Live Charts', type: 'url', url: 'https://tradingview.com' },
            { text: '⚡ VIP Signals Channel', type: 'url', url: 'https://t.me' }
          ]
        ]
      },
      {
        id: 'b_c_foot',
        type: 'footer',
        text: '⚠️ Disclaimer: Not financial advice. Always DYOR (Do Your Own Research).'
      }
    ]
  },
  {
    id: 'tpl_community_event',
    name: '🎪 Community Summit & Meetup Event',
    category: 'Community & Events',
    blocks: [
      {
        id: 'b_e_head',
        type: 'heading',
        level: 1,
        text: '🎪 Tech Summit 2026: The Future of Automation'
      },
      {
        id: 'b_e_para',
        type: 'paragraph',
        text: 'Join 500+ builders, creators, and engineers in Bangalore for our flagship annual convention. Free passes available now!'
      },
      {
        id: 'b_e_photo',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
        caption: '📍 Main Auditorium Stage & Networking Hub'
      },
      {
        id: 'b_e_list',
        type: 'list',
        listType: 'numbered',
        items: [
          'Keynote: Next-gen AI Bots & Mini Apps',
          'Hands-on Workshop: Building Rich Message Pipelines',
          'Panel: Channel Monetization & Automation',
          'Afterparty & Networking'
        ]
      },
      {
        id: 'b_e_map',
        type: 'map',
        latitude: 12.9716,
        longitude: 77.5946,
        title: 'Bangalore International Exhibition Center'
      },
      {
        id: 'b_e_details',
        type: 'details',
        title: '🎟️ Frequently Asked Questions (FAQ)',
        content: 'Q: Is entry free?\nA: Yes, general tickets are free with prior registration.\n\nQ: Will there be live streaming?\nA: Yes, live video will be broadcasted to our Telegram Channel.'
      },
      {
        id: 'b_e_btn',
        type: 'buttons',
        buttons: [
          [
            { text: '🎟️ Register Free Pass', type: 'url', url: 'https://example.com/tickets' },
            { text: '📍 Get Directions', type: 'url', url: 'https://maps.google.com' }
          ]
        ]
      },
      {
        id: 'b_e_foot',
        type: 'footer',
        text: 'Organized by NovaEsp Developer Community • Limited seats remaining.'
      }
    ]
  }
];
