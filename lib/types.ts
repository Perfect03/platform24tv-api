export interface CoreConfig {
  DOMAIN_FRONT: string
  DOMAIN_API: string
}

export interface IDevices {
  id: string
  name?: string
  device_type: string
  vendor: string
  model: string
  version: string
  serial: string
  os_name: string
  os_version: string
  timezone: string
  timezone_utcoffset: number
  application_type: string
  profile?: string
  store_source?: string
  settings?: string
  notification?: string
  interfaces?: unknown[]
  created_at: string
  login_at?: string
  user_id: number
  parental_settings?: unknown
  codec_structure_exist: boolean
}

export interface IProvider {
  id: number
  name: string
  proxy?: string
  agreements: {
    terms?: unknown
    privacy?: unknown
    subscripition?: unknown
  }
  landing: {
    logo?: string
    url: string
    shortname: string
    regform_btn_url: string
    regform_btn_caption: string
    login: {
      title: string
      description: string
    }
    support: {
      email: string
      phone: string
      url: string
    }
  }
  auto_auth: string
  is_have_purchases: boolean
  is_allow_additional_packets_without_base: boolean
  free_channels_count: number
  store_sources: unknown[]
  language?: string
  currency: {
    ASCII_NAME: string
    FORMAT: string
    UTF_NAME: string
    ISO_CODE: string
  }
  phone_mask: string
}


export interface IAuth {
  access_token: string
  expired?: string
  device?: string
  profile:  IProfile
}
export interface IProfile {
  id: string
  name: string
  icon: string
  background: string
  profile: {
    id: number
    role: string
    name: string
    icon: string
    background: string
    description?: string
  }
}
export interface IAccount {
  id: string
  username: string
  first_name: string
  last_name: string
  provider_uid?: string
  parental_code: string
  parental_status: string
  phone: string
  email?: string
  timezone: string
  timezone_utcoffset: number
  device_limit: number
  accounts: {
    id: number
    amount: string
    is_payment_allowed: boolean
  }
  provider: IProvider
  is_provider_free: boolean
  is_active: boolean
  is_testuser: boolean
  is_self_deletion_allowed: boolean
  is_validated: boolean
  is_guest: boolean
  last_login: string
  date_joined: string
  subscriptions: unknown[]
  refer_id?: string
  parental_dialogue: string
  unaccepted_agreement_ids: string
}

export interface IGenre {
  id: string
  name: string
  row_id: string
  row_slug: string
}
export interface ICountry {
  id: string
  name: string
}
export interface IActor {
  id: number
  slug: string
  role: string
  name: string
  priority: number
  image_url: string
  subtitle: string
  bio?: string
  roles: string[]
}
export interface IRating {
  external_id: string
  type: string
  rating: string
  name: string
  color: string
}
export interface IMotionRating {
  text: string
  age: number
  rating_system: string
  image: {
    mobile_width_pt: number
    mobile_height_pt: number
    mobile_x2: string
    mobile_x3: string
    tv_width_pt: number
    tv_height_pt: number
    tv_x1: string
    tv_x15: string
    tv_x3: string
  }
}

export interface IContent {
  age: number
  background: {
    tv: string
    web: string
    phone: string
    tablet: string
  }
  content_type: 'movie'|'series'|'program'|'episode'
  contents: unknown[]
  countries: ICountry[]
  cover: {
    src_2x3: string
    src_16x9: string
  }
  description: string
  duration: number
  genres: IGenre[]
  graphic_title?: string
  id: string
  is_announcement: boolean
  libraries: {id: string}[]
  parent_id?: string
  rating?: string
  ratings: IRating[]
  season: number
  series: number
  short: string
  slug: string
  title: string
  trailers: {id: string, library: string}[]
  year: string
  persons: IActor[]
  is_cartoon: boolean
  motion_rating: IMotionRating
}

export interface IContentEpisode {
  id: string
  title: string
  slug: string
  content_type: string
  season: number
  series: number
  description: string
  duration: number
  cover: {
    src_2x3?: string
    src_16x9?: string
  }
  is_announcement: boolean
}
export interface IContentStream {
  motion_rating: IMotionRating
  type: string
  from: number
  to: number
  mime_type: string
  age: number
  hls?: string
  drm?: {
    streams: {
      type: string
      name: string
      license: string
      url: string
    }[]
    fpsCertificate: string
    laFairplay: string
    laPlayready: string
    laWidevine: string
    drm_provider: string
  }
  stat: {id: string}
}
