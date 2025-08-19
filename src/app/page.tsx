import Image from "next/image";

import { Button } from "@/components/ui/button";

import { IconDiamond } from "@/assets/icons/diamonds";

export default function Home() {
  return (
    <main>
      <div className="overflow-x-clip">
        <section className="container relative max-w-7xl border-x">
          <div className="grid grid-cols-2 items-center gap-4 py-12">
            <div>
              <h1 className="font-bold text-4xl">Vacuum Suction Phone Holder</h1>
              <p className="text-lg text-muted-foreground">
                Secure your phone while driving - hands-free, safe, and stable.
              </p>
              <Button>
                <IconDiamond className="text-brand-500" />
                <span>Claim the Deal</span>
              </Button>
            </div>
            <div>
              <Image alt="Vacuum Suction Phone Holder" height={500} src="/images/vacuum-holder.webp" width={500} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
