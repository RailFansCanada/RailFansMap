declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.sdf" {
  const value: any;
  export = value;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.sql" {
  const content: string;
  export default content;
}
