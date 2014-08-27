var App = Ember.Application.create({
  LOG_TRANSITIONS: true
});
App.Router.map(function() {
  this.route('credits', { path: '/thanks' });
  this.resource('products', function() {
    this.resource('product', { path: '/:product_id' });
    this.route('onsale');
    this.route('deals');
  });
  this.resource('contacts', function() {
    this.resource('contact', { path: '/:contact_id' });
  });
});

App.IndexController = Ember.ArrayController.extend({
  productsCount: Ember.computed.alias('length'),
  logo: 'images/logo-small.png',
  time: function() {
    return (new Date()).toDateString();
  }.property(),
  onSale: function() {
    return this.filterBy('isOnSale').slice(0,3);
  }.property('@each.isOnSale')
});
App.ContactsIndexController = Ember.Controller.extend({
  contactName: 'Anostagia',
  avatar: 'images/avatar.png',
  open: function() {
    return ((new Date()).getDay() === 0) ? "Closed" : "Open";
  }.property()
});
App.ProductsController = Ember.ArrayController.extend({
  sortProperties: ['title']
});
App.ContactsController = Ember.ArrayController.extend({
  sortProperties: ['name'],
  contactsCount: Ember.computed.alias('length')
});
App.ReviewsController = Ember.ArrayController.extend({
  sortProperties: ['reviewedAt'],
  sortAscending: false
});
App.ContactProductsController = Ember.ArrayController.extend({
  sortProperties: ['title']
});
App.ProductController = Ember.ObjectController.extend({
  ratings: [1,2,3,4,5],
  isNotReviewed: Ember.computed.alias('review.isNew'),
  review: function(){
    return this.store.createRecord('review',{
      product: this.get('model')
    });
  }.property('model'),
  actions: {
    createReview: function(){
      var controller = this;
      this.get('review').set('reviewedAt', new Date());
      this.get('review').save().then(function(review){
        controller.get('model.reviews')
                  .addObject(review);
      });
    }
  }
});

App.ProductsRoute = Ember.Route.extend({
  model: function() {
    return this.store.findAll('product');
  }
});
App.ContactsRoute = Ember.Route.extend({
  model: function() {
    return this.store.findAll('contact');
  }
});
App.IndexRoute = Ember.Route.extend({
  model: function(){
    return this.store.findAll('product');
  }
});
App.ProductsIndexRoute = Ember.Route.extend({
  model: function(){
    return this.store.findAll('product');
  }
});
App.ProductsOnsaleRoute = Ember.Route.extend({
  model: function(){
    return this.modelFor('products').filterBy('isOnSale');
  }
});
App.ProductsDealsRoute = Ember.Route.extend({
  model: function(){
    return this.modelFor('products').filter(function(product){
      return product.get('price') < 500;
    });
  }
});

App.ReviewView = Ember.View.extend({
  isExpanded: false,
  classNameBindings: ['isExpanded', 'readMore'],
  click: function(){
    this.toggleProperty('isExpanded');
  },
  readMore: function(){
    return this.get('length') > 140;
  }.property('length')
});

App.ProductDetailsComponent = Ember.Component.extend({
 reviewsCount: Ember.computed.alias('product.reviews.length'),
  hasReviews: function(){
    return this.get('reviewsCount') > 0;
  }.property('reviewsCount')
});
App.ContactDetailsComponent = Ember.Component.extend({
  productsCount: Ember.computed.alias('contact.products.length'),
  isProductive: function() {
    return this.get('productsCount') > 3;
  }.property('productsCount')
});

App.ProductView = Ember.View.extend({
  isOnSale: Ember.computed.alias('controller.isOnSale'),
  classNameBindings: ['isOnSale']
});

App.ApplicationAdapter = DS.FixtureAdapter.extend();
App.Product = DS.Model.extend({
  title: DS.attr('string'),
  price: DS.attr('string'),
  description: DS.attr('string'),
  isOnSale: DS.attr('boolean'),
  image: DS.attr('string'),
  reviews: DS.hasMany('review', { async: true }),
  crafter: DS.belongsTo('contact', { async: true }),
  rating: function() {
    if(this.get('reviews.length') === 0) { return 0; }
    return this.get('reviews').reduce(function(previousValue, review) {
      return previousValue + review.get('rating');
    }, 0) / this.get('reviews.length');
  }.property('reviews.@each.rating')
});

App.Product.FIXTURES = [
 {  id: 1,
    title: 'Bird and Flower',
    price: '99',
    description: 'Get inspiration from traditional Chinese painting.',
    isOnSale: true,
    image: 'images/products/bird.jpg',
    reviews: [100,101],
    crafter: 200
  },
  {
    id: 2,
    title: 'Russian style china',
    price: '249',
    description: 'A beautiful handicraft art from Russia.',
    isOnSale: false,
    image: 'images/products/china.jpg',
    reviews: [],
    crafter: 201
  },
  {
    id: 3,
    title: 'Flower plate',
    price: '499',
    description: 'Plate decorated with delicate pattern.',
    isOnSale: true,
    reviews: [],
    image: 'images/products/plate.jpg',
    crafter: 201
  },
  {
    id: 4,
    title: 'Pencil Animal',
    price: '999',
    description: 'An animal made with used pencils. Beautiful and environmental.',
    isOnSale: false,
    reviews: [],
    image: 'images/products/pencil.jpg',
    crafter: 200
  },
  {
    id: 5,
    title: 'The Face',
    price: '499',
    description: 'A human face made with different elements.',
    isOnSale: true,
    reviews: [],
    image: 'images/products/face.jpg',
    crafter: 201
  },
  {
    id: 6,
    title: 'A tree in sunset',
    price: '499,999',
    description: 'A beautiful painting made by a new gifted artist Samuel',
    isOnSale: true,
    reviews: [103,104],
    image: 'images/products/tree.jpg',
    crafter: 202
  }
];

App.Contact = DS.Model.extend({
  name: DS.attr('string'),
  about: DS.attr('string'),
  avatar: DS.attr('string'),
  products: DS.hasMany('product', { async: true })
});
App.Contact.FIXTURES = [
  {
    id: 200,
    name: 'Jacky Cheung',
    about: 'Although Giamia came from a humble spark of lightning, he quickly grew to be a great craftsman, providing all the warming instruments needed by those close to him.',
    avatar: 'images/contacts/jacky.jpg',
    products: [1,2]
  },
  {
    id: 201,
    name: 'Andy Lau',
    about: 'Knowing there was a need for it, Andy Lau drew on her experience and spearheaded the Flint & Flame storefront. In addition to coding the site, she also creates a few products available in the store.',
    avatar: 'images/contacts/Andy Lau.jpg',
    products: [3,4,5]
  },
  {
    id: 202,
    name: 'Samuel B.',
    about: 'A talented new artist.',
    avatar: 'images/contacts/sam.jpg',
    products: [6]
  }
];

App.Review = DS.Model.extend({
  text: DS.attr('string'),
  reviewedAt: DS.attr('date'),
  product: DS.belongsTo('product'),
  rating: DS.attr('number')
});
App.Review.FIXTURES = [
  {
    id: 100,
    reviewedAt: new Date('12/10/2013').getTime(),
    text: "This work is amazing, I love this artist's design!",
    rating: 4
  },
  {
    id: 101,
    reviewedAt: new Date('12/12/2013').getTime(),
    text: "Like it, but it can be better on the details.",
    rating: 5
  },
  {
    id: 103,
    reviewedAt: new Date('9/10/2013').getTime(),
    text: "Amazing!!",
    rating: 4
  },
  {
    id: 104,
    reviewedAt: new Date('5/1/2013').getTime(),
    text: "So beautiful!",
    rating: 5
  },
  {
    id: 102,
    reviewedAt: new Date('12/30/2013').getTime(),
    text: "This is some amazing Flint! It lasts **forever** and works even when damp! I still remember the first day when I was only a little fire sprite and got one of these in my flame stalking for treemas. My eyes lit up the moment I tried it! Here's just a few uses for it:\n\n* Create a fire using just a knife and kindling!\n* Works even after jumping in a lake (although, that's suicide for me)\n* Small enough to fit in a pocket -- if you happen to wear pants\n\n\nYears later I'm still using the _same one_. That's the biggest advantage of this -- it doesn't run out easily like matches. As long as you have something to strike it against, **you can start a fire anywhere** you have something to burn!",
    rating: 5
  }
];
