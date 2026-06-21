import { and, asc, count, desc, eq, gte, like, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export async function getMarketplaceHomepageData() {
  const db = getDatabase();

  const [
    totalListings,
    totalOrders,
    totalSellers,
    verifiedSellers,
    categories,
    featuredListings,
    trendingListings,
    newestListings,
    topSellers,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.marketplaceListings)
      .where(eq(schema.marketplaceListings.status, "ACTIVE"))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: count() })
      .from(schema.orders)
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: count() })
      .from(schema.sellerProfiles)
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: count() })
      .from(schema.sellerProfiles)
      .where(and(eq(schema.sellerProfiles.isVerifiedSeller, true)))
      .then((r) => r[0]?.count ?? 0),

    db
      .select()
      .from(schema.marketplaceCategories)
      .orderBy(asc(schema.marketplaceCategories.position))
      .then((cats) =>
        Promise.all(
          cats.map(async (cat) => {
            const [{ cnt }] = await db
              .select({ cnt: count() })
              .from(schema.marketplaceListings)
              .where(
                and(
                  eq(schema.marketplaceListings.categoryId, cat.id),
                  eq(schema.marketplaceListings.status, "ACTIVE"),
                ),
              );
            return { ...cat, _count: { listings: cnt } };
          }),
        ),
      ),

    db
      .select({
        id: schema.marketplaceListings.id,
        title: schema.marketplaceListings.title,
        slug: schema.marketplaceListings.slug,
        shortDescription: schema.marketplaceListings.shortDescription,
        basePrice: schema.marketplaceListings.basePrice,
        deliveryDays: schema.marketplaceListings.deliveryDays,
        rating: schema.marketplaceListings.rating,
        reviewCount: schema.marketplaceListings.reviewCount,
        sales: schema.marketplaceListings.sales,
        views: schema.marketplaceListings.views,
        favorites: schema.marketplaceListings.favorites,
        featured: schema.marketplaceListings.featured,
        createdAt: schema.marketplaceListings.createdAt,
        seller: {
          userId: schema.sellerProfiles.userId,
          displayName: schema.sellerProfiles.displayName,
          avatar: schema.sellerProfiles.avatar,
          verificationStatus: schema.sellerProfiles.verificationStatus,
          isTopSeller: schema.sellerProfiles.isTopSeller,
          trustScore: schema.sellerProfiles.trustScore,
        },
        category: {
          name: schema.marketplaceCategories.name,
          slug: schema.marketplaceCategories.slug,
        },
      })
      .from(schema.marketplaceListings)
      .innerJoin(
        schema.sellerProfiles,
        eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
      )
      .innerJoin(
        schema.marketplaceCategories,
        eq(
          schema.marketplaceListings.categoryId,
          schema.marketplaceCategories.id,
        ),
      )
      .where(
        and(
          eq(schema.marketplaceListings.status, "ACTIVE"),
          eq(schema.marketplaceListings.featured, true),
        ),
      )
      .orderBy(desc(schema.marketplaceListings.createdAt))
      .limit(6),

    db
      .select({
        id: schema.marketplaceListings.id,
        title: schema.marketplaceListings.title,
        slug: schema.marketplaceListings.slug,
        shortDescription: schema.marketplaceListings.shortDescription,
        basePrice: schema.marketplaceListings.basePrice,
        deliveryDays: schema.marketplaceListings.deliveryDays,
        rating: schema.marketplaceListings.rating,
        reviewCount: schema.marketplaceListings.reviewCount,
        sales: schema.marketplaceListings.sales,
        views: schema.marketplaceListings.views,
        favorites: schema.marketplaceListings.favorites,
        featured: schema.marketplaceListings.featured,
        createdAt: schema.marketplaceListings.createdAt,
        seller: {
          userId: schema.sellerProfiles.userId,
          displayName: schema.sellerProfiles.displayName,
          avatar: schema.sellerProfiles.avatar,
          verificationStatus: schema.sellerProfiles.verificationStatus,
          isTopSeller: schema.sellerProfiles.isTopSeller,
          trustScore: schema.sellerProfiles.trustScore,
        },
        category: {
          name: schema.marketplaceCategories.name,
          slug: schema.marketplaceCategories.slug,
        },
      })
      .from(schema.marketplaceListings)
      .innerJoin(
        schema.sellerProfiles,
        eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
      )
      .innerJoin(
        schema.marketplaceCategories,
        eq(
          schema.marketplaceListings.categoryId,
          schema.marketplaceCategories.id,
        ),
      )
      .where(
        and(
          eq(schema.marketplaceListings.status, "ACTIVE"),
          gte(schema.marketplaceListings.sales, 1),
        ),
      )
      .orderBy(desc(schema.marketplaceListings.sales))
      .limit(6),

    db
      .select({
        id: schema.marketplaceListings.id,
        title: schema.marketplaceListings.title,
        slug: schema.marketplaceListings.slug,
        shortDescription: schema.marketplaceListings.shortDescription,
        basePrice: schema.marketplaceListings.basePrice,
        deliveryDays: schema.marketplaceListings.deliveryDays,
        rating: schema.marketplaceListings.rating,
        reviewCount: schema.marketplaceListings.reviewCount,
        sales: schema.marketplaceListings.sales,
        views: schema.marketplaceListings.views,
        favorites: schema.marketplaceListings.favorites,
        featured: schema.marketplaceListings.featured,
        createdAt: schema.marketplaceListings.createdAt,
        seller: {
          userId: schema.sellerProfiles.userId,
          displayName: schema.sellerProfiles.displayName,
          avatar: schema.sellerProfiles.avatar,
          verificationStatus: schema.sellerProfiles.verificationStatus,
          isTopSeller: schema.sellerProfiles.isTopSeller,
          trustScore: schema.sellerProfiles.trustScore,
        },
        category: {
          name: schema.marketplaceCategories.name,
          slug: schema.marketplaceCategories.slug,
        },
      })
      .from(schema.marketplaceListings)
      .innerJoin(
        schema.sellerProfiles,
        eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
      )
      .innerJoin(
        schema.marketplaceCategories,
        eq(
          schema.marketplaceListings.categoryId,
          schema.marketplaceCategories.id,
        ),
      )
      .where(eq(schema.marketplaceListings.status, "ACTIVE"))
      .orderBy(desc(schema.marketplaceListings.createdAt))
      .limit(6),

    db
      .select({
        userId: schema.sellerProfiles.userId,
        username: schema.users.username,
        displayName: schema.sellerProfiles.displayName,
        avatar: schema.sellerProfiles.avatar,
        trustScore: schema.sellerProfiles.trustScore,
        verificationStatus: schema.sellerProfiles.verificationStatus,
        isTopSeller: schema.sellerProfiles.isTopSeller,
        totalSales: schema.sellerProfiles.totalSales,
        averageRating: schema.sellerProfiles.averageRating,
      })
      .from(schema.sellerProfiles)
      .innerJoin(
        schema.users,
        eq(schema.sellerProfiles.userId, schema.users.id),
      )
      .where(eq(schema.sellerProfiles.isVerifiedSeller, true))
      .orderBy(desc(schema.sellerProfiles.trustScore))
      .limit(5),
  ]);

  return {
    stats: { totalListings, totalOrders, totalSellers, verifiedSellers },
    categories,
    featuredListings: featuredListings.map(normalizeListing),
    trendingListings: trendingListings.map(normalizeListing),
    newestListings: newestListings.map(normalizeListing),
    topSellers,
  };
}

function normalizeListing(listing: any) {
  return {
    ...listing,
    rating: Number(listing.rating) || 0,
    media: [],
  };
}

export async function getMarketplaceListings(params: {
  categorySlug?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const db = getDatabase();
  const { categorySlug, search, sort, page = 1, perPage = 24 } = params;
  const offset = (page - 1) * perPage;

  const conditions = [eq(schema.marketplaceListings.status, "ACTIVE")];

  if (categorySlug) {
    const [cat] = await db
      .select({ id: schema.marketplaceCategories.id })
      .from(schema.marketplaceCategories)
      .where(eq(schema.marketplaceCategories.slug, categorySlug))
      .limit(1);
    if (cat) {
      conditions.push(eq(schema.marketplaceListings.categoryId, cat.id));
    }
  }

  if (search) {
    conditions.push(like(schema.marketplaceListings.title, `%${search}%`));
  }

  const where = and(...conditions);

  let orderClause;
  switch (sort) {
    case "price-low":
      orderClause = asc(schema.marketplaceListings.basePrice);
      break;
    case "price-high":
      orderClause = desc(schema.marketplaceListings.basePrice);
      break;
    case "rating":
      orderClause = desc(schema.marketplaceListings.rating);
      break;
    case "newest":
      orderClause = desc(schema.marketplaceListings.createdAt);
      break;
    case "orders":
      orderClause = desc(schema.marketplaceListings.sales);
      break;
    default:
      orderClause = desc(schema.marketplaceListings.createdAt);
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.marketplaceListings)
    .where(where);

  const items = await db
    .select({
      id: schema.marketplaceListings.id,
      title: schema.marketplaceListings.title,
      slug: schema.marketplaceListings.slug,
      shortDescription: schema.marketplaceListings.shortDescription,
      basePrice: schema.marketplaceListings.basePrice,
      deliveryDays: schema.marketplaceListings.deliveryDays,
      rating: schema.marketplaceListings.rating,
      reviewCount: schema.marketplaceListings.reviewCount,
      sales: schema.marketplaceListings.sales,
      views: schema.marketplaceListings.views,
      favorites: schema.marketplaceListings.favorites,
      featured: schema.marketplaceListings.featured,
      createdAt: schema.marketplaceListings.createdAt,
      seller: {
        userId: schema.sellerProfiles.userId,
        displayName: schema.sellerProfiles.displayName,
        avatar: schema.sellerProfiles.avatar,
        verificationStatus: schema.sellerProfiles.verificationStatus,
        isTopSeller: schema.sellerProfiles.isTopSeller,
        trustScore: schema.sellerProfiles.trustScore,
      },
      category: {
        name: schema.marketplaceCategories.name,
        slug: schema.marketplaceCategories.slug,
      },
    })
    .from(schema.marketplaceListings)
    .innerJoin(
      schema.sellerProfiles,
      eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
    )
    .innerJoin(
      schema.marketplaceCategories,
      eq(
        schema.marketplaceListings.categoryId,
        schema.marketplaceCategories.id,
      ),
    )
    .where(where)
    .orderBy(orderClause)
    .limit(perPage)
    .offset(offset);

  return {
    items: items.map(normalizeListing),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getListingBySlug(slug: string) {
  const db = getDatabase();

  const [listing] = await db
    .select({
      id: schema.marketplaceListings.id,
      title: schema.marketplaceListings.title,
      slug: schema.marketplaceListings.slug,
      shortDescription: schema.marketplaceListings.shortDescription,
      descriptionJson: schema.marketplaceListings.descriptionJson,
      basePrice: schema.marketplaceListings.basePrice,
      deliveryDays: schema.marketplaceListings.deliveryDays,
      revisions: schema.marketplaceListings.revisions,
      rating: schema.marketplaceListings.rating,
      reviewCount: schema.marketplaceListings.reviewCount,
      sales: schema.marketplaceListings.sales,
      views: schema.marketplaceListings.views,
      favorites: schema.marketplaceListings.favorites,
      featured: schema.marketplaceListings.featured,
      createdAt: schema.marketplaceListings.createdAt,
      seller: {
        id: schema.sellerProfiles.id,
        userId: schema.sellerProfiles.userId,
        username: schema.users.username,
        displayName: schema.sellerProfiles.displayName,
        bio: schema.sellerProfiles.bio,
        avatar: schema.sellerProfiles.avatar,
        bannerImage: schema.sellerProfiles.bannerImage,
        website: schema.sellerProfiles.website,
        verificationStatus: schema.sellerProfiles.verificationStatus,
        trustScore: schema.sellerProfiles.trustScore,
        totalSales: schema.sellerProfiles.totalSales,
        totalReviews: schema.sellerProfiles.totalReviews,
        averageRating: schema.sellerProfiles.averageRating,
        responseRate: schema.sellerProfiles.responseRate,
        responseTime: schema.sellerProfiles.responseTime,
        completionRate: schema.sellerProfiles.completionRate,
        isVerifiedSeller: schema.sellerProfiles.isVerifiedSeller,
        isTopSeller: schema.sellerProfiles.isTopSeller,
        joinedMarketplaceAt: schema.sellerProfiles.joinedMarketplaceAt,
      },
      category: {
        id: schema.marketplaceCategories.id,
        name: schema.marketplaceCategories.name,
        slug: schema.marketplaceCategories.slug,
      },
    })
    .from(schema.marketplaceListings)
    .innerJoin(
      schema.sellerProfiles,
      eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
    )
    .innerJoin(schema.users, eq(schema.sellerProfiles.userId, schema.users.id))
    .innerJoin(
      schema.marketplaceCategories,
      eq(
        schema.marketplaceListings.categoryId,
        schema.marketplaceCategories.id,
      ),
    )
    .where(
      and(
        eq(schema.marketplaceListings.slug, slug),
        eq(schema.marketplaceListings.status, "ACTIVE"),
      ),
    )
    .limit(1);

  if (!listing) return null;

  const [packages, faqs, reviews] = await Promise.all([
    db
      .select()
      .from(schema.listingPackages)
      .where(eq(schema.listingPackages.listingId, listing.id))
      .orderBy(asc(schema.listingPackages.price)),
    db
      .select()
      .from(schema.listingFaq)
      .where(eq(schema.listingFaq.listingId, listing.id))
      .orderBy(asc(schema.listingFaq.position)),
    db
      .select({
        id: schema.buyerReviews.id,
        rating: schema.buyerReviews.rating,
        content: schema.buyerReviews.content,
        isVerifiedPurchase: schema.buyerReviews.isVerifiedPurchase,
        isRecommended: schema.buyerReviews.isRecommended,
        createdAt: schema.buyerReviews.createdAt,
        buyer: {
          username: schema.users.username,
          displayName: schema.users.displayName,
        },
      })
      .from(schema.buyerReviews)
      .innerJoin(schema.users, eq(schema.buyerReviews.buyerId, schema.users.id))
      .where(eq(schema.buyerReviews.listingId, listing.id))
      .orderBy(desc(schema.buyerReviews.createdAt))
      .limit(10),
  ]);

  return {
    ...listing,
    rating: Number(listing.rating) || 0,
    packages,
    faqs,
    reviews: reviews.map((r) => ({
      ...r,
      rating: Number(r.rating),
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      isRecommended: Boolean(r.isRecommended),
    })),
  };
}

export async function getSellerByUsername(username: string) {
  const db = getDatabase();

  const [seller] = await db
    .select({
      userId: schema.sellerProfiles.userId,
      username: schema.users.username,
      displayName: schema.sellerProfiles.displayName,
      bio: schema.sellerProfiles.bio,
      avatar: schema.sellerProfiles.avatar,
      bannerImage: schema.sellerProfiles.bannerImage,
      website: schema.sellerProfiles.website,
      joinedMarketplaceAt: schema.sellerProfiles.joinedMarketplaceAt,
      verificationStatus: schema.sellerProfiles.verificationStatus,
      trustScore: schema.sellerProfiles.trustScore,
      totalSales: schema.sellerProfiles.totalSales,
      totalReviews: schema.sellerProfiles.totalReviews,
      averageRating: schema.sellerProfiles.averageRating,
      responseRate: schema.sellerProfiles.responseRate,
      responseTime: schema.sellerProfiles.responseTime,
      completionRate: schema.sellerProfiles.completionRate,
      isVerifiedSeller: schema.sellerProfiles.isVerifiedSeller,
      isTopSeller: schema.sellerProfiles.isTopSeller,
    })
    .from(schema.sellerProfiles)
    .innerJoin(schema.users, eq(schema.sellerProfiles.userId, schema.users.id))
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!seller) return null;

  const listings = await db
    .select({
      id: schema.marketplaceListings.id,
      title: schema.marketplaceListings.title,
      slug: schema.marketplaceListings.slug,
      shortDescription: schema.marketplaceListings.shortDescription,
      basePrice: schema.marketplaceListings.basePrice,
      deliveryDays: schema.marketplaceListings.deliveryDays,
      rating: schema.marketplaceListings.rating,
      reviewCount: schema.marketplaceListings.reviewCount,
      sales: schema.marketplaceListings.sales,
      views: schema.marketplaceListings.views,
      favorites: schema.marketplaceListings.favorites,
      featured: schema.marketplaceListings.featured,
      createdAt: schema.marketplaceListings.createdAt,
      seller: {
        userId: schema.sellerProfiles.userId,
        displayName: schema.sellerProfiles.displayName,
        avatar: schema.sellerProfiles.avatar,
        verificationStatus: schema.sellerProfiles.verificationStatus,
        isTopSeller: schema.sellerProfiles.isTopSeller,
        trustScore: schema.sellerProfiles.trustScore,
      },
      category: {
        name: schema.marketplaceCategories.name,
        slug: schema.marketplaceCategories.slug,
      },
    })
    .from(schema.marketplaceListings)
    .innerJoin(
      schema.sellerProfiles,
      eq(schema.marketplaceListings.sellerId, schema.sellerProfiles.id),
    )
    .innerJoin(
      schema.marketplaceCategories,
      eq(
        schema.marketplaceListings.categoryId,
        schema.marketplaceCategories.id,
      ),
    )
    .where(
      and(
        eq(schema.sellerProfiles.userId, seller.userId),
        eq(schema.marketplaceListings.status, "ACTIVE"),
      ),
    )
    .orderBy(desc(schema.marketplaceListings.sales));

  const reviews = await db
    .select({
      id: schema.buyerReviews.id,
      rating: schema.buyerReviews.rating,
      content: schema.buyerReviews.content,
      isVerifiedPurchase: schema.buyerReviews.isVerifiedPurchase,
      isRecommended: schema.buyerReviews.isRecommended,
      createdAt: schema.buyerReviews.createdAt,
      buyer: {
        username: schema.users.username,
        displayName: schema.users.displayName,
      },
    })
    .from(schema.buyerReviews)
    .innerJoin(schema.users, eq(schema.buyerReviews.buyerId, schema.users.id))
    .where(eq(schema.buyerReviews.sellerId, seller.userId))
    .orderBy(desc(schema.buyerReviews.createdAt))
    .limit(10);

  return {
    ...seller,
    averageRating: Number(seller.averageRating) || 0,
    listings: listings.map((l) => ({
      ...l,
      rating: Number(l.rating) || 0,
      media: [],
    })),
    reviews: reviews.map((r) => ({
      ...r,
      rating: Number(r.rating),
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      isRecommended: Boolean(r.isRecommended),
    })),
  };
}

export async function getMarketplaceCategories() {
  const db = getDatabase();
  return db
    .select()
    .from(schema.marketplaceCategories)
    .orderBy(asc(schema.marketplaceCategories.position));
}
