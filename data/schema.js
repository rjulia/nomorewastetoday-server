const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Client {
    id: ID
    name: String
    surname: String
    namecomplete: String
    company: String
    years: Int
    email: String
    type: TypeClient
    seller: ID
  }

  type Link {
    id: ID
    title__en: String
    title__zh: String
    url: String
    content__en: String
    content__zh: String
    imageUrl: String
    category: String
  }

  type Location {
    id: ID
    name: String
    content__en: String
    content__zh: String
    address: String
    imageUrl: String
    webUrl: String
    lat: Float
    lng: Float
    tel: String
    contact: String
    email: String
    opening: String
    facebook: String
    recycleBy: [TypeRecycling]
    category: TypeLocationCategory
    district: TypeDistrict
  }

  type Source {
    id: String
    name: String
  }

  type News {
    source: Source
    author: String
    title: String
    description: String
    url: String
    urlToImage: String
    publishedAt: String
    content: String
  }

  type EmailCampaing {
    id: ID
    email_address: String
    unique_email_id: String
    timestamp_opt: String
    web_id: Int
    email_type: String
    status: String
  }

  type EmailRespond {
    status: String
    res: String
  }

  type Event {
    id: ID
    title: String
    place: String
    content__en: String
    content__zh: String
    imageUrl: String
    webUrl: String
    date: String
    lng: Float
    lat: Float
    email: String
    facebook: String
    recomendations: String
    category: [TypeEventCategory]
    stateEvent: TypeEventState
  }

  type Shop {
    id: ID
    name: String
    address: String
    phone: String
    email: String
    webUrl: String
    facebook: String
    instagram: String
    lng: Float
    lat: Float
    promoded: Boolean
    imageUrl: String
    thumbnail: String
    description: String
    rate: Int
    plasticfree: Int
    category: [TypeShopCategory]
  }
  type MarkDown {
    text: String
    html: String
  }
  type Advice {
    id: ID
    title__en: String
    title__zh: String
    statement__en: String
    statement__zh: String
    author: String
    contentWhy__en: MarkDown
    contentWhy__zh: MarkDown
    contentWhat__en: MarkDown
    contentWhat__zh: MarkDown
    contentHow__en: MarkDown
    contentHow__zh: MarkDown
    imageUrlWhy: String
    authorWhy: String
    linkWhy: String
    imageUrlWhat: String
    authorWhat: String
    linkWhat: String
    date: String
    products: [Product]
  }

  type Product {
    id: ID
    name__en: String
    name__zh: String
    price: Float
    link: String
    newness: Boolean
    imageUrl: String
    description__en: String
    description__zh: String
    brand: String
    category: TypeProduct
    advice: Advice
  }
  # Old stuffs
  type Order {
    id: ID
    order: [OderProduct]
    total: Float
    date: String
    client: ID
    state: StateOrder
  }

  type OderProduct {
    id: ID
    quantity: Int
  }

  type TotalClient {
    total: Float
    client: [Client]
  }

  type TotalSeller {
    total: Float
    seller: [User]
  }
  type Token {
    token: String
  }
  # Si cuando creas usuario, que en este caso solo es usario y contrasena, aqui habroa que completar
  type User {
    id: ID
    user: String
    name: String
    rol: Rol
  }
  enum TypeDistrict {
    CENTRAL_WESTERN
    WAN_CHAI
    EASTERN
    SOUTHERN
    YAU_TSIM_MONG
    SHAM_SHUI_PO
    KOWLOON_CITY
    WONG_TAI_SIN
    KWUN_TONG
    TSUEN_WAN
    TUEN_MUN
    YUEN_LONG
    KWAI_TSING
    ISLANDS
    NORTH
    TAI_PO
    SHA_TIN
    SAI_KUNG
  }
  enum TypeLinkCategory {
    ONG
    GOVERNMENT
    PRIVATE
    SHOP
  }
  enum TypeLocationCategory {
    COMMUNITY
    COLLECTOR
    ORGANIZATIONS
    CLOTHES
    WASTE_SEPARATION
  }

  enum TypeRecycling {
    PAPER
    COMPUTER_PRODUCTS
    USED_OCOOKING_OIL
    TONNER_CARTRIDEGE
    METAL
    PLASTIC
    RUBER_TYRE
    ELEC_APPLIANCE
    RECHARGABLE_BATTERIE
    FLOURESCENT
    CLOTHES
    GLASS
    FURMITURE
    FOOD
    BOOKS
    OTHERS
  }

  enum TypeEventCategory {
    RUN
    CHARITY
    CLEAN
    RECYCLE
    MEETUP
    LEARN
    OUTDOOR
    COMMUNITY
  }

  enum TypeEventState {
    POSTPONED
    CANCEL
    ONGOING
  }

  enum TypeShopCategory {
    FOOD
    CATERING
    HOME
    HEALTHCARE
    CLOTHES
    SPORTS
    OTHERS
  }

  enum TypeProduct {
    HOME
    EATING
    DRINKING
    BAGS
    BEAUTY
    FOOD
    BOOKS
    EDUCATION
    EVENT
    OTHERS
  }

  enum TypeClient {
    BASIC
    PREMIUM
  }

  enum StateOrder {
    PENDING
    COMPLETE
    CANCELLED
  }

  enum Rol {
    ADMIN
    SELLER
  }

  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
  }

  type Query {
    #Clients
    # clients : [Client]
    # client(id: ID) : Client
    uploads: [File]
    getClients(limit: Int, offset: Int, seller: String): [Client]
    getClient(id: ID): Client
    totalClients: String

    # LINKS
    getLinks(category: TypeLinkCategory): [Link]
    getLink(id: ID): Link

    # LOCATIONS
    getLocations(
      recycleBy: [TypeRecycling]
      category: TypeLocationCategory
      district: TypeDistrict
    ): [Location]
    getLocation(id: ID): Location

    # EVENTS
    getEvents(category: TypeEventCategory): [Event]
    getEvent(id: ID): Event

    # Shops
    getShops(category: TypeShopCategory): [Shop]
    getShop(id: ID): Shop
    # Advice
    getAdvices: [Advice]
    getAdvice(id: ID): Advice

    #News
    getNewsInfo: [News]

    getEmailCampaing: [EmailCampaing]

    #Products
    getProducts(category: TypeProduct): [Product]
    getProduct(id: ID): Product
    totalProducts: String
    #Orders
    getOrders(client: String): [Order]
    #graficas
    topClients: [TotalClient]
    topSellers: [TotalSeller]

    #token get users
    getUser: User
  }
  """
  Campos para los cliente nuevos
  """
  input ClientInput {
    id: ID
    name: String
    surname: String
    namecomplete: String
    company: String
    years: Int
    email: String
    type: TypeClient
    seller: ID
  }
  """
  LINKS
  """
  input LinkInput {
    id: ID
    title__en: String
    title__zh: String
    url: String
    content__en: String
    content__zh: String
    imageUrl: String
    category: String
  }

  """
  LOCATIONS
  """
  input LocationInput {
    id: ID
    name: String
    content__en: String
    content__zh: String
    address: String
    imageUrl: String
    webUrl: String
    lat: Float
    lng: Float
    tel: String
    contact: String
    email: String
    opening: String
    facebook: String
    recycleBy: [TypeRecycling]
    category: TypeLocationCategory
    district: TypeDistrict
  }

  """
  EMAIL CAMPING
  """
  input EmailCampaingInput {
    id: ID
    email_address: String
    status: String
  }

  """
  EVENTS
  """
  input EventInput {
    id: ID
    title: String
    place: String
    content__en: String
    content__zh: String
    imageUrl: String
    webUrl: String
    lng: Float
    lat: Float
    date: String
    email: String
    facebook: String
    recomendations: String
    category: [TypeEventCategory]
    stateEvent: TypeEventState
  }

  """
  SHOPS
  """
  input ShopInput {
    id: ID
    name: String
    address: String
    phone: String
    email: String
    webUrl: String
    facebook: String
    instagram: String
    lng: Float
    lat: Float
    promoded: Boolean
    imageUrl: String
    thumbnail: String
    description: String
    rate: Int
    plasticfree: Int
    category: [TypeShopCategory]
  }

  """
  ADVICE
  """
  input MarkDownInput {
    text: String
    html: String
  }

  input AdviceInput {
    id: ID
    title__en: String
    title__zh: String
    statement__en: String
    statement__zh: String
    author: String
    contentWhy__en: MarkDownInput
    contentWhy__zh: MarkDownInput
    contentWhat__en: MarkDownInput
    contentWhat__zh: MarkDownInput
    contentHow__en: MarkDownInput
    contentHow__zh: MarkDownInput
    imageUrlWhy: String
    authorWhy: String
    linkWhy: String
    imageUrlWhat: String
    authorWhat: String
    linkWhat: String
    date: String
    products: [AdviceProductInput]
  }

  input AdviceProductInput {
    id: ID
  }

  """
  Campos para los pedidos nuevos
  """
  input OrderInput {
    id: ID
    order: [OderProductInput]
    total: Float
    date: String
    client: ID
    state: StateOrder
    seller: ID
  }

  input OderProductInput {
    id: ID
    quantity: Int
  }

  input FileInput {
    id: ID
    path: String
    filename: String
    mimetype: String
  }

  """
  Campos para los nuevos productos
  """
  input ProductInput {
    id: ID
    name__en: String
    name__zh: String
    price: Float
    link: String
    newness: Boolean
    imageUrl: String
    description__en: String
    description__zh: String
    brand: String
    category: TypeProduct
  }

  type Mutation {
    #Clients
    setClient(input: ClientInput): Client
    uploadClient(input: ClientInput): Client
    deleteClient(id: ID!): String

    #Links
    setLink(input: LinkInput): Link
    uploadLink(input: LinkInput): Link
    deleteLink(id: ID!): String

    #Locations
    setLocation(input: LocationInput): Location
    uploadLocation(input: LocationInput): Location
    deleteLocation(id: ID!): String

    #Events
    setEvent(input: EventInput): Event
    uploadEvent(input: EventInput): Event
    deleteEvent(id: ID!): String

    #Shop
    setShop(input: ShopInput): Shop
    uploadShop(input: ShopInput): Shop
    deleteShop(id: ID!): String

    #advice
    setAdvice(input: AdviceInput): Advice
    uploadAdvice(input: AdviceInput): Advice
    deleteAdvice(id: ID!): String

    #Products
    setProduct(input: ProductInput): Product
    uploadProduct(input: ProductInput): Product
    deleteProduct(id: ID!): String

    #Orders
    setOrders(input: OrderInput): Order
    updateOrders(input: OrderInput): Order

    #users
    createUser(
      user: String!
      name: String!
      rol: String!
      password: String!
    ): String
    authUser(user: String!, password: String!): Token

    #files
    #uploadFile(file: Upload!): String!
    singleUpload(file: Upload!): File!
    multipleUpload(files: [Upload!]!): [File!]!

    #email campeing
    addEmailCampaing(input: EmailCampaingInput): EmailRespond
    deleteEmailCampaing(email: String!): String
  }
`;

module.exports = { typeDefs };
