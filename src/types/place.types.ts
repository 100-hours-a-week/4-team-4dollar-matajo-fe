export {};

export interface LocalDeal {
  id: number;
  title: string;
  discount: string;
  image_url: string;
}

export interface LocalDealsResponse {
  success: boolean;
  message: string;
  data: {
    local_info_id: number;
    posts: LocalDeal[];
  };
}
