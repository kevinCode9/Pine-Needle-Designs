const collectionNavLinks = [
  { label: 'Adirondack Bridal', path: '/collections/adirondack-bridal', slug: 'adirondack-bridal' },
  { label: 'Adirondack Chic', path: '/collections/adirondack-chic', slug: 'adirondack-chic' },
  { label: 'Boot Bands', path: '/collections/boot-bands', slug: 'boot-bands' },
  { label: 'Bracelets', path: '/collections/bracelets', slug: 'bracelets' },
  { label: 'Chic Jewelry', path: '/collections/chic-jewelry', slug: 'chic-jewelry' },
  { label: 'Cuffs', path: '/collections/cuffs', slug: 'cuffs' },
  { label: 'Denim & Lace', path: '/collections/denim-and-lace', slug: 'denim-and-lace' },
  { label: 'Earrings', path: '/collections/earrings', slug: 'earrings' },
  { label: 'Hat Bands', path: '/collections/hat-bands', slug: 'hat-bands' },
  { label: 'Jackets', path: '/collections/jackets', slug: 'jackets' },
  { label: 'Jeans', path: '/collections/jeans', slug: 'jeans' },
  { label: 'Limited Time', path: '/collections/limited-time', slug: 'limited-time' },
  { label: 'Necklaces', path: '/collections/necklaces', slug: 'necklaces' },
  { label: 'Pooch Smooches', path: '/collections/pooch-smooches', slug: 'pooch-smooches' },
  { label: 'Purses', path: '/collections/purses', slug: 'purses' },
  { label: 'Shirts', path: '/collections/shirts', slug: 'shirts' },
  { label: 'Shoes', path: '/collections/shoes', slug: 'shoes' },
  { label: 'Shorts', path: '/collections/shorts', slug: 'shorts' },
  { label: 'Upcycled Collaboration', path: '/collections/upcycled-collaboration', slug: 'upcycled-collaboration' },
  { label: 'Upcycled Logo', path: '/collections/upcycled-logo', slug: 'upcycled-logo' },
  { label: 'Upcycled Denim', path: '/collections/upcycled-denim', slug: 'upcycled-denim' },
  { label: 'Vests', path: '/collections/vests', slug: 'vests' },
]

export const collectionCategoryOrder = [
  {
    title: 'Clothing Collections',
    slugs: ['jackets', 'shirts', 'shoes', 'vests', 'jeans', 'shorts', 'upcycled-collaboration', 'upcycled-logo', 'upcycled-denim'],
  },
  {
    title: 'Jewelry & Accessories',
    slugs: ['earrings', 'necklaces', 'bracelets', 'cuffs', 'hat-bands', 'boot-bands', 'purses'],
  },
  {
    title: 'Specialty Collections',
    slugs: ['adirondack-bridal', 'adirondack-chic', 'pooch-smooches', 'chic-jewelry'],
  },
]

export const collectionPages = [
  {
    slug: 'adirondack-bridal',
    title: 'Adirondack Bridal Collection',
    path: '/collections/adirondack-bridal',
    cardImage: '/images/comingsoon/adkbridalcomingsoon.webp',
    description: 'Hand-cut denim, luxe trims, and mountain-ready detailing designed for the bold bride who loves heritage craft and unexpected glamour.',
    products: [],
  },
  {
    slug: 'adirondack-chic',
    title: 'Adirondack Chic',
    path: '/collections/adirondack-chic',
    showWhenEmpty: true,
    cardImage: '/images/adirondack-chic-collection/torquoise-white-speedy-bag/turquoise-white-speedy-bag1.webp',
    cardImageFromProduct: true,
    description: 'Country-chic Adirondack style with rustic textures, bold details, and handcrafted attitude.',
    products: [
      {
        id: 1,
        title: 'Turquoise and White Leather Speedy Bag',
        price: 230,
        meta: ['Price: $230', 'Size: Small', 'Size: Large (SOLD)'],
        description: 'Great for us turquoise gals! Adirondack Chic.',
        images: [
          '/images/adirondack-chic-collection/torquoise-white-speedy-bag/turquoise-white-speedy-bag1.webp',
          '/images/adirondack-chic-collection/torquoise-white-speedy-bag/turquoise-white-speedy-bag2.webp',
          '/images/adirondack-chic-collection/torquoise-white-speedy-bag/turquoise-white-speedy-bag3.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'boot-bands',
    title: 'Boot Bands',
    path: '/collections/boot-bands',
    cardImage: '/images/adirondack-chic/seasonal-adirondack-chic/whitechristmasboots.webp',
    description: 'Studded detail for every boot.',
    products: [],
  },
  {
    slug: 'bracelets',
    title: 'Bracelets',
    path: '/collections/bracelets',
    cardImage: '/images/comingsoon/comingsoon1.webp',
    description: 'Handwoven metals for texture.',
    products: [],
  },
  {
    slug: 'chic-jewelry',
    title: 'Chic Jewelry',
    path: '/collections/chic-jewelry',
    cardImage: '/images/comingsoon/comingsoon2.webp',
    description: 'Mixed metals with delicate stones.',
    products: [],
  },
  {
    slug: 'cuffs',
    title: 'Cuffs',
    path: '/collections/cuffs',
    cardImage: '/images/comingsoon/comingsoon001.webp',
    description: 'Bold silhouette with tactile finish.',
    products: [],
  },
  {
    slug: 'earrings',
    title: 'Earrings',
    path: '/collections/earrings',
    cardImage: '/images/ear-rings/ear-rings-1a.webp',
    description: 'Red flower earrings, 2.5" long.',
    products: [
      {
        id: 2,
        title: 'Red Flower',
        price: 38,
        meta: ['Price: $38', 'Size: 2.5" long'],
        description: 'Red flower earrings, 2.5" long.',
        images: [
          '/images/ear-rings/ear-rings-1a.webp',
          '/images/ear-rings/ear-rings-2a.webp',
          '/images/ear-rings/ear-rings-2b.webp',
          '/images/ear-rings/ear-rings-2c.webp',
          '/images/ear-rings/ear-rings-2d.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'hat-bands',
    title: 'Hat Bands',
    path: '/collections/hat-bands',
    cardImage: '/images/comingsoon/comingsoon002.webp',
    description: 'Feather accents with beaded thread.',
    products: [],
  },
  {
    slug: 'jackets',
    title: 'Jackets',
    path: '/collections/jackets',
    cardImage: '/images/jackets/ruby-lee/ruby-lee-1a.webp',
    description: "This patriotic jean jacket is the ultimate tribute to classic Americana. Re-designed with satin, lace, fringe, and star studs and amber stones. Designed for the salute to America.",
    products: [
      {
        id: 3,
        title: "America She's Beautiful",
        price: 214,
        meta: ['Price: $214.00 plus sales tax with free shipping', 'Size: M/L'],
        description: "This patriotic jean jacket is the ultimate tribute to classic Americana. Re-designed with satin, lace, fringe, and star studs and amber stones. Designed for the salute to America.",
        images: ['/images/jackets/america-she-beautiful/jacket1a.webp', '/images/jackets/america-she-beautiful/jacket1b.webp'],
        videos: ['/videos/jackets/america-she-beautiful.webm'],
        videoPosters: ['/images/video-posters/jackets/america-she-beautiful/america-she-beautiful.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 4,
        title: 'Ruby Lee',
        price: 264,
        meta: ['Price: $264', 'Size: M/L'],
        description: 'She is an upcycled Jean jacket. Ruby Lee loves her gold brooches and bright ribbon trims mixed with red and clear beaded dangles of crystals. She has flowers of red burgundy and cream roses all appliquéd on her back. And a matching burgundy mesh peplum of mermaid sequins at the waist. Cuffs are turned up and pockets are removed for more embellishments. A lower long narrow pocket was added with a butterfly brooch. Keeping with her rustic nature, the denim is very soft but her bougie attitude shows off ivory fringe and multiple laces. A red plaid buck brings it all together. Definitely Adirondack Chic! Where she lives.',
        images: [
          '/images/jackets/ruby-lee/ruby-lee-1a.webp',
          '/images/jackets/ruby-lee/ruby-lee-1b.webp',
          '/images/jackets/ruby-lee/ruby-lee-1d.webp',
        ],
        videos: [
          '/videos/jackets/ruby-lee1a.webm',
        ],
        videoPosters: [
          '/images/video-posters/jackets/ruby-lee/ruby-lee1a.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 5,
        title: 'Carmen',
        price: 222,
        sold: true,
        meta: ['Price: $222', 'Size: XL Ladies'],
        description: "Carmen is a light weight Cream colored jean jacket. The back is all hand stamped with exotic inks. Carmen is a special order and isn't finished yet. She will be adorned with jewels and possibly feathers. An updated picture is coming! Stay tuned. Created by Wende Maliani.",
        images: ['/images/jackets/carmen/carmen.webp'],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'jeans',
    title: 'Jeans',
    path: '/collections/jeans',
    cardImage: '/images/comingsoon/comingsoon003.webp',
    description: 'Sculpted fit with vintage wash.',
    products: [],
  },
  {
    slug: 'limited-time',
    title: 'Limited-Time Collection',
    path: '/collections/limited-time',
    hidden: true,
    cardImage: '',
    description: 'A small-batch limited-time collection coming soon.',
    products: [],
  },
  {
    slug: 'necklaces',
    title: 'Necklaces',
    path: '/collections/necklaces',
    cardImage: '/images/comingsoon/comingsoon004.webp',
    description: 'Mix of chains and charms.',
    products: [],
  },
  {
    slug: 'pooch-smooches',
    title: 'The Pooch Smooches Collection',
    path: '/collections/pooch-smooches',
    cardImage: '/images/poochsmooches/Polaris-and-Luna_1.webp',
    description: 'Bandanas, collars, and keepsakes made to celebrate the snuggly pals who are already obsessed with hugs.',
    products: [],
  },
  {
    slug: 'shirts',
    title: 'Shirts',
    path: '/collections/shirts',
    cardImage: '/images/shirts/wende-choice-blinged-out-sweatshirt/wende-choice-blinged-out-sweatshirt-1a.webp',
    description: 'Blinged Out T-Shirts and Sweatshirts made to stand out.',
    filters: ['T-Shirts', 'Sweatshirts'],
    products: [
      {
        id: 6,
        title: 'On a Bad Day there’s Always Lipstick Blinged Out Sweatshirt',
        filters: ['Sweatshirts'],
        price: 58,
        noBlingPrice: 28,
        meta: ['Price: $58', 'Available in Peach, Natural, Grey, Sand, and White.'],
        description: "WENDE's CHOICE! On a Bad Day There's ALWAYS Lipstick! Blinged Out sweatshirt. Comes in Peach, Natural, Grey, Sand, and White.",
        noBlingDescription: "WENDE's CHOICE! On a Bad Day There's ALWAYS Lipstick! Sweatshirt. Comes in Peach, Natural, Grey, Sand, and White.",
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['Peach', 'Natural', 'Grey', 'Sand', 'White'],
            placeholder: 'Select color',
          },
        ],
        images: [
          '/images/shirts/wende-choice-blinged-out-sweatshirt/wende-choice-blinged-out-sweatshirt-1a.webp',
          '/images/shirts/wende-choice-blinged-out-sweatshirt/wende-choice-blinged-out-sweatshirt-1b.webp',
        ],
        videos: ['/videos/shirts/wende-choice-blinged-out-sweatshirt/wende-choice.webm'],
        videoPosters: ['/images/video-posters/shirts/wende-choice-blinged-out-sweatshirt/wende-choice-blinged-out-sweatshirt.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 7,
        title: 'Turquoise Chic Blinged Out T-Shirt',
        filters: ['T-Shirts'],
        price: 38,
        noBlingPrice: 28,
        meta: ['Price: $38', 'Available in Peach, Natural, Pink, Sand, and White.', 'Free shipping'],
        description: 'Turquoise Chick is Blinged Out with fused on rhinestones on her cowboy hat and parts of her jewelry. Rustic and Chic.',
        noBlingDescription: 'Turquoise Chick T-Shirt. Rustic and Chic.',
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['Peach', 'Natural', 'Pink', 'Sand', 'White'],
            placeholder: 'Select color',
          },
        ],
        images: [
          '/images/shirts/cowgirl-tshirt/1.webp',
          '/images/shirts/cowgirl-tshirt/2.webp',
        ],
        videos: ['/videos/shirts/cowgirl-tshirt/1.webm'],
        videoPosters: ['/images/video-posters/shirts/cowgirl-tshirt/cowgirl-tshirt.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 8,
        title: 'On a Bad Day there’s Always Lipstick Blinged Out T-Shirt',
        filters: ['T-Shirts'],
        price: 38,
        noBlingPrice: 28,
        meta: ['Price: $38', 'Available in Peach, Natural, Grey, Sand, and White.', 'Free shipping'],
        description: "WENDE's CHOICE! On a Bad Day There's ALWAYS Lipstick! Blinged Out T-shirt. Comes in Peach, Natural, Grey, Sand, and White.",
        noBlingDescription: "WENDE's CHOICE! On a Bad Day There's ALWAYS Lipstick! T-shirt. Comes in Peach, Natural, Grey, Sand, and White.",
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['Peach', 'Natural', 'Grey', 'Sand', 'White'],
            placeholder: 'Select color',
          },
        ],
        images: ['/images/shirts/wende-choice-blinged-out-tshirt/wende-choice-blinged-out-tshirt-11.webp'],
        videos: ['/videos/shirts/wende-choice-blinged-out-tshirt/wende-choice-blinged-out-tshirt-1b.webm'],
        videoPosters: ['/images/shirts/wende-choice-blinged-out-tshirt/wende-choice-blinged-out-tshirt-11.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 9,
        title: "Don't Burst My Bubble Blinged Out T-Shirt",
        filters: ['T-Shirts'],
        price: 38,
        noBlingPrice: 28,
        meta: ['Price: $38', 'Available in Peach, Natural, Pink, Sand, and White.', 'Free shipping'],
        description: "A Cowgirl with Attitude. Of course she's all Blinged Out!",
        noBlingDescription: 'A Cowgirl with Attitude T-Shirt.',
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['Peach', 'Natural', 'Pink', 'Sand', 'White'],
            placeholder: 'Select color',
          },
        ],
        images: ['/images/shirts/dont-burst-my-bubble/dont-burst-my-bubble.webp'],
        videos: ['/videos/shirts/dont-burst-my-bubble/dont-burst-my-bubble.webm'],
        videoPosters: ['/images/video-posters/shirts/dont-burst-my-bubble/dont-burst-my-bubble.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 10,
        title: 'Cowgirl Concert Goer T-Shirt',
        filters: ['T-Shirts'],
        price: 38,
        noBlingPrice: 28,
        meta: ['Price: $38', 'Sizes: S-3X', 'Comes in white, grey, sand, natural, and pink.', 'Free shipping'],
        description: 'Blinged out Tshirt.',
        noBlingDescription: 'T-shirt.',
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['White', 'Grey', 'Sand', 'Natural', 'Pink'],
            placeholder: 'Select color',
          },
        ],
        images: ['/images/shirts/cowgirl-concert-goer/cowgirl-concert-goer1.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 11,
        title: 'Guts, Grit And Lipstick Blinged Out T-Shirt',
        filters: ['T-Shirts'],
        price: 38,
        noBlingPrice: 28,
        meta: ['Price: $38', 'Sizes: S-3X', 'Comes in white, peach, pink, sand, and natural.', 'Free shipping'],
        description: 'Blinged out T-Shirt.',
        noBlingDescription: 'T-Shirt.',
        options: [
          {
            name: 'Style',
            values: ['Bling', 'No Bling'],
            placeholder: 'Select style',
          },
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['White', 'Peach', 'Pink', 'Sand', 'Natural'],
            placeholder: 'Select color',
          },
        ],
        images: ['/images/shirts/guts-grit-lipstick/guts-grit-lipstick1.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 12,
        title: 'Happy Girls are the PRETTIEST! Blinged Out T-Shirt',
        filters: ['T-Shirts'],
        price: 38,
        meta: ['Price: $38', 'Available in White, Gray, Sand, Peach, and Natural.'],
        description: 'Is that Audrey Hepburn blowing a blue bubble? From the Bubble Blower Collection! Added is a touch of highlights of bling. Priced the same for all sizes and colors listed. Perfect for your Bubble Blower T-shirt Collection. And... there are more Bubble Blowers listed in my shop. Go Look!',
        options: [
          {
            name: 'Size',
            values: ['Small', 'Medium', 'Large', 'XL', '2X', '3X'],
            placeholder: 'Select size',
          },
          {
            name: 'Color',
            values: ['White', 'Gray', 'Sand', 'Peach', 'Natural'],
            placeholder: 'Select color',
          },
        ],
        images: ['/images/shirts/happy-girls-are-the-prettiest-tshirt/happygirls1.webp'],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'purses',
    title: 'Purses',
    path: '/collections/purses',
    cardImage: '/images/comingsoon/comingsoon005.webp',
    description: 'Structured shape with mixed leather.',
    products: [],
  },
  {
    slug: 'shoes',
    title: 'Shoes',
    path: '/collections/shoes',
    cardImage: '/images/shoes/blush-satin-heels.webp',
    description: 'One-of-a-kind footwear with handcrafted Pine Needle Designs style.',
    products: [
      {
        id: 32,
        title: 'Betsey Johnson Blush Satin Heels',
        filters: ['Shoes'],
        shoeTypes: ['Satin Heels'],
        price: 129,
        sold: true,
        meta: ['Price: $129', 'Size: 9.5', 'Color: Blush Satin', 'Ankle strap and toe band'],
        description: 'Stiletto block heel for a dressy look. Back zipper closure for easy wear.',
        images: [
          '/images/shoes/blush-satin-heels.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'shorts',
    title: 'Shorts',
    path: '/collections/shorts',
    cardImage: '/images/comingsoon/comingsoon006.webp',
    description: 'A-line shape with luxe hardware.',
    products: [],
  },
  {
    slug: 'denim-and-lace',
    title: 'Denim & Lace',
    path: '/collections/denim-and-lace',
    cardImage: '/images/whimsical-fairy/crowna.webp',
    description: 'Limited-run upcycled pieces crafted to stand out.',
    filters: ['Vests', 'Bracelets'],
    products: [
      {
        id: 13,
        title: 'The Crowned Hare Vest',
        filters: ['Vests'],
        price: 77,
        meta: ['Price: $77', 'Size: M/L'],
        description: 'This bunny is picture perfect with her resting in the woods of the Adirondacks wearing her crown of gold and rhinestones. 2 gold flower brooches popping out. Chain of gold leaves and rainbow crystals shine down on her. Rust embroidery travel around the denim vest. Lace and pearls outline the hem and neck. 2 front pockets are trimmed in either pearls and lace or stamped ink trees and a chain of leaves and crystals. One of a kind Country Chic or Whimsical Fairy.',
        images: [
          '/images/whimsical-fairy/crowna.webp',
          '/images/whimsical-fairy/crownb.webp',
          '/images/whimsical-fairy/crownc.webp',
          '/images/whimsical-fairy/whim1.webp',
          '/images/whimsical-fairy/whim2.webp',
          '/images/whimsical-fairy/whim3.webp',
          '/images/whimsical-fairy/whim4.webp',
          '/images/whimsical-fairy/whim5.webp',
          '/images/whimsical-fairy/whim6.webp',
        ],
        videos: ['/videos/whimsical-fairy/whim.webm'],
        videoPosters: ['/images/video-posters/whimsical-fairy/whim.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 14,
        title: 'Brandi Bracelet',
        filters: ['Bracelets'],
        price: 29,
        meta: ['Price: $29', 'Size: 7 to 7.5"'],
        description: 'Brandi is a bracelet with a denim band. She is trimmed in lace flowers and has an ivory floral brooch with 3 large pearls and scattered rhinestones. Attached is bridal leaf lace with a triple circle and tiny rhinestones.',
        images: [
          '/images/denimlace/brandybracelet/brandybracelet1.webp',
          '/images/denimlace/brandybracelet/brandybracelet2.webp',
          '/images/denimlace/brandybracelet/brandybracelet3.webp',
          '/images/denimlace/brandybracelet/brandybracelet4.webp',
          '/images/denimlace/brandybracelet/brandybracelet5.webp',
        ],
        videos: ['/videos/denimlace/brandybracelet/braceletbrandy.webm'],
        videoPosters: ['/images/video-posters/denimlace/brandybracelet/braceletbrandy.webp'],
        imageWrapper: 'image-frame',
      },
      {
        id: 15,
        title: 'Adeline Bracelet',
        filters: ['Bracelets'],
        price: 32,
        meta: ['Price: $32', 'Size: 7-8"', 'Stretches to 8"'],
        description: 'Adeline is a country chic bracelet. Denim, lace, pink chiffon, and a matching rose colored cameo. Trimmed in gold boucle ribbon and a string of pearls. Fastens in the back with a pearl flower and centered rhinestone. Closure is a corded elastic. Adeline stretches to 8".',
        images: [
          '/images/denimlace/adelinebracelet/adeline-bracelet-1.webp',
          '/images/denimlace/adelinebracelet/adeline-bracelet-2.webp',
          '/images/denimlace/adelinebracelet/adeline-bracelet-3.webp',
          '/images/denimlace/adelinebracelet/adeline-bracelet-4.webp',
        ],
        videos: [
          '/videos/denimlace/adelinebracelet/adeline-bracelet-01.webm',
          '/videos/denimlace/adelinebracelet/adeline-bracelet-02.webm',
        ],
        videoPosters: [
          '/images/video-posters/denimlace/adelinebracelet/adeline-bracelet-01.webp',
          '/images/video-posters/denimlace/adelinebracelet/adeline-bracelet-02.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'upcycled-collaboration',
    title: 'Upcycled Collaboration',
    path: '/collections/upcycled-collaboration',
    cardImage: '/images/upcycled-collaboration/adirondack-chic-leather-cowhide-overnight-duffel-bag/cowhide-bag1.webp',
    cardImageFromProduct: true,
    description: 'Collaborative upcycled pieces with country-chic materials and handcrafted details.',
    filters: ['Bags', 'Fanny Packs', 'Wallets'],
    products: [
      {
        id: 16,
        title: 'Adirondack Chic Leather and Cowhide Overnight Duffel Bag',
        filters: ['Bags'],
        bagTypes: ['Duffel Bags'],
        price: 160,
        meta: ['Price: $160'],
        maker: 'Made by jGypsie',
        description: 'A definite for traveling and weekend stays.',
        images: [
          '/images/upcycled-collaboration/adirondack-chic-leather-cowhide-overnight-duffel-bag/cowhide-bag1.webp',
          '/images/upcycled-collaboration/adirondack-chic-leather-cowhide-overnight-duffel-bag/cowhide-bag2.webp',
          '/images/upcycled-collaboration/adirondack-chic-leather-cowhide-overnight-duffel-bag/cowhide-bag3.webp',
          '/images/upcycled-collaboration/adirondack-chic-leather-cowhide-overnight-duffel-bag/cowhide-bag4.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 17,
        title: 'Leather Fanny Pack with Fringe',
        filters: ['Fanny Packs'],
        price: 99,
        meta: ['Price: $99'],
        maker: 'Made by jGypsie',
        description: 'Upcycled leather in the USA. Convenient back zipper pocket. Great for a day at the rodeo or horse show! You decide.',
        images: [
          '/images/upcycled-collaboration/leather-fanny-pack/leather-fanny-pack1-1.webp',
          '/images/upcycled-collaboration/leather-fanny-pack/leather-fanny-pack1-2.webp',
          '/images/upcycled-collaboration/leather-fanny-pack/leather-fanny-pack1-3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 18,
        title: 'Cowhide Leather Checkered Wallet Wristlet',
        filters: ['Wallets'],
        price: 69,
        meta: ['Price: $69', 'Color: Orchid', 'Size: 3.5" x 5"', 'Made in the USA'],
        maker: 'Made by jGypsie',
        description: 'Made in the USA. Comes with leather wrist strap. Folds down to 3.5" x 5". What is more country chic than leather and cowhide? Cute!',
        images: [
          '/images/upcycled-collaboration/cowhide-leather-wallet-wristlet/cowhide-wristlet1.webp',
          '/images/upcycled-collaboration/cowhide-leather-wallet-wristlet/cowhide-wristlet2.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 19,
        title: 'Pink Tooled Leather Speedy Bag',
        filters: ['Bags'],
        bagTypes: ['Speedy Bags'],
        price: 189,
        meta: ['Price: $189'],
        maker: 'Made by jGypsie',
        description: 'Whether you are country Western or Adirondack Chic this bag is perfect for femininity and rustic style.',
        images: [
          '/images/upcycled-collaboration/pink-tooled-leather-speedy-bag/pink-tooled-leather-speedy-bag1.webp',
          '/images/upcycled-collaboration/pink-tooled-leather-speedy-bag/pink-tooled-leather-speedy-bag2.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'upcycled-logo',
    title: 'Upcycled Logo',
    path: '/collections/upcycled-logo',
    cardImage: '/images/upcycled-logo/barrette-lv-leather-french-style/barrette-lv-leather-french-style1.webp',
    cardImageFromProduct: true,
    description: 'Upcycled finds reimagined as one-of-a-kind accessories and statement pieces.',
    filters: ['Bags', 'Wallets', 'Accessories'],
    products: [
      {
        id: 20,
        title: 'Upcycled LOGO Barrette',
        filters: ['Accessories'],
        price: 49,
        meta: ['Price: $49', 'Lv leather French style', 'Hair clip brown'],
        maker: 'Made by jGypsie',
        description: 'Lv leather French style. Hair clip brown.',
        images: [
          '/images/upcycled-logo/barrette-lv-leather-french-style/barrette-lv-leather-french-style1.webp',
          '/images/upcycled-logo/barrette-lv-leather-french-style/barrette-lv-leather-french-style2.webp',
          '/images/upcycled-logo/barrette-lv-leather-french-style/barrette-lv-leather-french-style3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 21,
        title: 'Upcycled LV Canvas Pack',
        filters: ['Bags'],
        bagTypes: ['Packs'],
        price: 79,
        meta: ['Price: $79'],
        maker: 'Made by jGypsie',
        description: 'Perfect for walking with a stroller or dog leash. Fanny pack sling pack bum pack.',
        images: [
          '/images/upcycled-logo/upcycled-lv-canvas-pack/upcyled-canvas-pack1.webp',
          '/images/upcycled-logo/upcycled-lv-canvas-pack/upcyled-canvas-pack2.webp',
          '/images/upcycled-logo/upcycled-lv-canvas-pack/upcyled-canvas-pack3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 22,
        title: 'Upcycled LV Tooled Wristlet or Makeup Bag',
        filters: ['Bags', 'Wallets'],
        bagTypes: ['Makeup Bags', 'Wristlets'],
        price: 88,
        meta: ['Price: $88'],
        description: 'All recycled leather and hand tooled for that Adirondack Charm! Great for country Western and North country girls alike!',
        images: [
          '/images/upcycled-logo/upcycled-makeup-bag/upcyled-makeup-bag1.webp',
          '/images/upcycled-logo/upcycled-makeup-bag/upcyled-makeup-bag2.webp',
          '/images/upcycled-logo/upcycled-makeup-bag/upcyled-makeup-bag3.webp',
          '/images/upcycled-logo/upcycled-makeup-bag/upcyled-makeup-bag4.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 23,
        title: 'The LV Cowhide Leather Fringe Western (or Adirondack) Crossbody Bag',
        filters: ['Bags'],
        bagTypes: ['Crossbody Bags'],
        price: 160,
        meta: ['Price: $160', 'Color: Rustic Charm and Feminine'],
        description: 'One of a kind. Nicely concealed back zipper pocket. Love that leather fringe.',
        images: [
          '/images/upcycled-logo/lv-cowhide-western-bag/cowhide-bag1.webp',
          '/images/upcycled-logo/lv-cowhide-western-bag/cowhide-bag2.webp',
          '/images/upcycled-logo/lv-cowhide-western-bag/cowhide-bag3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 24,
        title: 'Upcycled Black Suede and Brown Tooled Leather Backpack',
        filters: ['Bags'],
        bagTypes: ['Backpacks'],
        price: 160,
        meta: ['Price: $160', 'Color: Black suede and brown tooled leather', 'Size: 15”X9.5”X5”'],
        description: 'Of course with the Lv logo! Great for school or a hike! Stitching is the famous boot stitch.',
        images: [
          '/images/upcycled-logo/brown-tooled-leather-backpack/brown-tooled-leather-backpack1.webp',
          '/images/upcycled-logo/brown-tooled-leather-backpack/brown-tooled-leather-backpack2.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 25,
        title: 'Cowhide Lv Faux Leather Shoulder Bag',
        filters: ['Bags'],
        bagTypes: ['Shoulder Bags'],
        price: 138,
        meta: ['Price: $138', 'Color: Golden brown', 'Durable faux leather with cowhide'],
        description: 'A nice rich golden brown color with a roomy inside for an iPad and make up bag. Durable faux leather with cowhide to match. Goes perfect with Lv logo.',
        images: [
          '/images/upcycled-logo/cowhide-shoulder-bag/cowhide-shoulder-bag1.webp',
          '/images/upcycled-logo/cowhide-shoulder-bag/cowhide-shoulder-bag2.webp',
          '/images/upcycled-logo/cowhide-shoulder-bag/cowhide-shoulder-bag3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 26,
        title: 'Upcycled LV Logo Bag',
        filters: ['Bags'],
        bagTypes: ['Crossbody Bags'],
        price: 171,
        meta: ['Price: $171', 'Pink and white checkered', 'Natural cowhide and leather fringe', "There's only one"],
        description: "This crossbody bag is pink and white checkered with natural cowhide and leather fringe. Total statement bag with that LV logo! And there's only one!",
        images: [
          '/images/upcycled-logo/upcycled-lv-logo-bag/upcycled-lv-logo-bag1.webp',
          '/images/upcycled-logo/upcycled-lv-logo-bag/upcycled-lv-logo-bag2.webp',
          '/images/upcycled-logo/upcycled-lv-logo-bag/upcycled-lv-logo-bag3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 27,
        title: 'The Weekender Tote Bag',
        filters: ['Bags'],
        bagTypes: ['Tote Bags'],
        price: 98,
        meta: ['Price: $98', 'Neutral canvas tones', 'Brown leather handles'],
        description: 'Perfect neutral tones on canvas and brown leather handles. Of course you will rock it with the LV logo! Very roomy and fun with the canvas front fringe and flashy dark diamond print.',
        images: [
          '/images/upcycled-logo/weekender-tote-bag/weekender-tote-bag1.webp',
          '/images/upcycled-logo/weekender-tote-bag/weekender-tote-bag2.webp',
          '/images/upcycled-logo/weekender-tote-bag/weekender-tote-bag3.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 28,
        title: 'LV Upcycled Cowhide Leather Bag',
        filters: ['Bags'],
        bagTypes: ['Crossbody Bags', 'Clutches'],
        price: 118,
        meta: ['Price: $118', 'Color: Golden brown', 'Crossbody or handheld clutch', 'Comes with 2 straps'],
        description: 'Two bags in one. LV upcycled cowhide leather bag. Crossbody or handheld clutch. You choose. Comes with 2 straps: one short for your wrist or arm and one long strap. Beautiful golden brown.',
        images: [
          '/images/cowhide-leather-bag/cowhide-leather-bag.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 29,
        title: 'Upcycled LV Cowhide Leather Fringe Crossbody Bag',
        filters: ['Bags'],
        bagTypes: ['Crossbody Bags'],
        price: 160,
        meta: ['Price: $160', 'Color: Brown', 'One of a kind', 'Western style'],
        description: 'Upcycled LV cowhide leather fringe crossbody bag. Brown. One of a kind bag. Western style with hand tooled front markings. Back has a zipped concealed compartment.',
        images: [
          '/images/leather-fringe-crossbody-bag/leather-fringe-crossbody-bag01.webp',
          '/images/leather-fringe-crossbody-bag/leather-fringe-crossbody-bag02.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 30,
        title: 'Cowhide Leather Wristlet',
        filters: ['Wallets'],
        price: 80,
        meta: ['Price: $80', 'Upcycled LV wallet bag and card holder', 'Braided leather handle', 'Medium brown cowhide'],
        description: 'Cowhide leather wristlet. Upcycled LV wallet bag and card holder. Small enough for your wrist or to insert in your large bag. Beautiful and convenient for running into the store. Handle is braided leather and the bag is a rich medium brown with matching two-tone cowhide. Brass metal holds the LV logo.',
        images: [
          '/images/wristlet-3/wristlet3-01.webp',
          '/images/wristlet-3/wristlet3-02.webp',
          '/images/wristlet-3/wristlet3-03.webp',
        ],
        imageWrapper: 'image-frame',
      },
      {
        id: 31,
        title: 'Upcycled LV Mini Flask Bag Charm',
        filters: ['Accessories'],
        price: 46,
        meta: ['Price: $46', 'Size: 2" x 2"'],
        description: 'Upcycled LV Mini Flask Bag Charm.',
        images: [
          '/images/upcycled-lv-mini-flask-bag-charm/upcycled-lv-mini-flask-bag-charm1.webp',
          '/images/upcycled-lv-mini-flask-bag-charm/upcycled-lv-mini-flask-bag-charm2.webp',
          '/images/upcycled-lv-mini-flask-bag-charm/upcycled-lv-mini-flask-bag-charm3.webp',
          '/images/upcycled-lv-mini-flask-bag-charm/upcycled-lv-mini-flask-bag-charm4.webp',
        ],
        imageWrapper: 'image-frame',
      },
    ],
  },
  {
    slug: 'upcycled-denim',
    title: 'Upcycled Denim',
    path: '/collections/upcycled-denim',
    cardImage: '/images/comingsoon/comingsoon007.webp',
    description: 'One-of-a-kind patchwork silhouette.',
    products: [],
  },
  {
    slug: 'vests',
    title: 'Vests',
    path: '/collections/vests',
    cardImage: '/images/comingsoon/comingsoon011.webp',
    description: 'Edgy layers with artisanal trim.',
    products: [],
  },
]

const firstProductImage = (page) =>
  page.products.find((product) => !product.placeholder && product.images?.length)?.images[0]

const freeShippingMeta = 'Free shipping'

const withFreeShippingMeta = (meta) => {
  const items = Array.isArray(meta) ? meta : [meta]
  return items.some((item) => String(item).trim().toLowerCase() === freeShippingMeta.toLowerCase())
    ? items
    : [...items, freeShippingMeta]
}

collectionPages.forEach((page) => {
  page.products.forEach((product) => {
    product.meta = withFreeShippingMeta(product.meta)
  })
  page.count = page.products.filter((product) => !product.placeholder).length
  if (page.cardImageFromProduct) {
    page.cardImage = firstProductImage(page) || page.cardImage
  }
  page.previous = null
  page.next = null
})

export const visibleCollectionPages = collectionPages.filter((page) => (page.count > 0 || page.showWhenEmpty) && !page.hidden)
const visibleCollectionSlugs = new Set(visibleCollectionPages.map((page) => page.slug))
const visibleCollectionBySlug = new Map(visibleCollectionPages.map((page) => [page.slug, page]))
const groupedCollectionSlugs = new Set(collectionCategoryOrder.flatMap((group) => group.slugs))
const orderedVisibleCollectionPages = [
  ...collectionCategoryOrder.flatMap((group) =>
    group.slugs.map((slug) => visibleCollectionBySlug.get(slug)).filter(Boolean)
  ),
  ...visibleCollectionPages.filter((page) => !groupedCollectionSlugs.has(page.slug)),
]

orderedVisibleCollectionPages.forEach((page, index) => {
  const previousIndex = (index - 1 + orderedVisibleCollectionPages.length) % orderedVisibleCollectionPages.length
  const nextIndex = (index + 1) % orderedVisibleCollectionPages.length

  page.previous = orderedVisibleCollectionPages.length > 1 ? orderedVisibleCollectionPages[previousIndex].slug : null
  page.next = orderedVisibleCollectionPages.length > 1 ? orderedVisibleCollectionPages[nextIndex].slug : null
})

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'All Collections', path: '/collections' },
  ...collectionNavLinks
    .filter((link) => visibleCollectionSlugs.has(link.slug))
    .map(({ label, path }) => ({ label, path })),
]

const allHomeSections = [
  {
    id: 'adirondack-bridal',
    title: 'Adirondack Bridal Collection',
    path: '/collections/adirondack-bridal',
    cards: [],
  },
  {
    id: 'pooch-smooches',
    title: 'The Pooch Smooches Collection',
    path: '/collections/pooch-smooches',
    cards: [],
  },
]

export const homeSections = allHomeSections.filter(
  (section) => visibleCollectionSlugs.has(section.id) && section.cards.length > 0
)

export const otherCollections = visibleCollectionPages.map((collection) => ({
  slug: collection.slug,
  title: collection.title,
  path: collection.path,
  cardImage: collection.cardImage,
  count: collection.count,
}))

export const sliderSlides = [
  {
    images: ['/images/1a.webp'],
  },
  {
    images: ['/images/2b.webp'],
  },
  {
    images: ['/images/3.webp'],
  },
  {
    images: ['/images/4.webp'],
  },
  {
    images: ['/images/5.webp'],
  },
]

export const sitePages = [
  {
    slug: 'about',
    path: '/about',
    title: 'About Pine Needle Designs',
    content: `
      <p>Pine Needle Designs crafts unique, upcycled clothing and accessories that blend boho spirit with sophisticated tailoring.</p>
      <p>Every piece is made in the USA using responsibly sourced denim, vintage trims, and artisan-made embellishments.</p>
      <p>Our studio is rooted in confident expression: we build garments to feel like celebration outfits for every body.</p>
      <p>We believe in slow design, hand-finishing details, and giving unused textiles a new life so you can wear something genuinely one-of-a-kind.</p>
    `,
  },
  {
    slug: 'collections',
    path: '/collections',
    title: 'Collections',
    content: `<p>Explore the full collection catalogue and discover one-of-a-kind clothing, jewelry, handbags, and more.</p>`,
  },
  {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    content: `<p>This website does not collect personal data beyond standard analytics and cookies.</p>`,
  },
  {
    slug: 'refund-policy',
    path: '/refund-policy',
    title: 'Refund Policy',
    content: `<p>All sales are final unless otherwise agreed for special orders.</p>`,
  },
  {
    slug: 'shipping-policy',
    path: '/shipping-policy',
    title: 'Shipping Policy',
    content: `<p>We ship domestically and internationally using standard carriers.</p>`,
  },
  {
    slug: 'terms-of-service',
    path: '/terms-of-service',
    title: 'Terms of Service',
    content: `
      <p>Use of this site is subject to our standard terms and conditions.</p>
      <h2>Buyer Sales Tax Notice</h2>
      <p>Sales tax is applied according to New York State and local sales tax rules. Qualifying clothing and footwear items under $110 may be exempt from New York State sales tax, but local tax rules may vary outside New York City. In New York City, qualifying clothing and footwear under $110 are generally tax exempt. Clothing and footwear priced at $110 or more, taxable accessories, and non-exempt items are generally subject to the applicable sales tax rate. If sales tax is included in the listed price, it will be handled in accordance with applicable New York tax rules and shown separately on receipts where required.</p>
    `,
  },
]
