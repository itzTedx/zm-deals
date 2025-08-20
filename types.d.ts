declare global {
  type SvgProps = React.SVGProps<SVGSVGElement>;
  type Review = {
    id: number;
    name: string;
    rating: number;
    date: Date;
    comment: string;
  };
}

export {};
