import Image from "next/image";
export default function AuthLayout({ children }) {
    return (
        <div className="flex relative ">
            <div className="fixed inset-0"></div>
            <div className="h-screen w-[41.25%] flex items-center  bg-auth-bg-gradient overflow-hidden relative -z-10">
                <div className="bgprops">
                    {/* Bottom Border  */}
                    {/* <Image className="absolute bottom-[107px] left-[285px]" src={`/auth/border_bottom.svg`} alt="bg-bottom-polygon" width={70} height={6} /> */}



                    {/* Top Polygon  */}
                    <Image className="absolute -top-[120px] -left-[45px] " style={{ height: 'auto' }} src={`/auth/bg-top-polygon.svg`} alt="bg-top-polygon" width={190} height={170} />

                    {/* Top Polygon  */}
                    <Image className="absolute -bottom-[120px] -right-[45px]" src={`/auth/bg-bottom-polygon.svg`} alt="bg-bottom-polygon" width={244} height={217} />
                </div>
                <div className="ml-[87px]  mr-[94px] flex flex-col gap-[65.5px] ">
                    <h1 className="font-bold text-white text-[53px] leading-[60px] relative">
                        <span >M 5 CONTINENTS </span>
                        <span className="flex gap-4 items-center">LOGISTICS  <Image className="" src={`/auth/m5-logo-lite.svg`} alt="M5C Logo" width={44} height={46} /></span>
                        {/* M5C Logo  */}
                        {/* <Image className="absolute bottom-[0.45rem] right-[7.5rem]" src={`/auth/m5-logo-lite.svg`} alt="M5C Logo" width={44} height={46} /> */}
                    </h1>
                    <div className="flex flex-col gap-8">
                        <AuthPageCards imgHeight={27} imgWidth={27} imgUrl={`work_history`} text1={`20 Years`} text2={`of experience`} />
                        <AuthPageCards imgHeight={27} imgWidth={27} imgUrl={`agents`} text1={`1000+ Agents`} text2={`Worldwide`} />
                        <AuthPageCards imgHeight={27} imgWidth={27} imgUrl={`delivery`} text1={`1M+ Delivered`} text2={`Shipment Worldwide`} />
                        <AuthPageCards imgHeight={27} imgWidth={27} imgUrl={`sector_globe`} text1={`5 Sector`} text2={`Servicing Worldwide`} />
                    </div>

                </div>
            </div>
            <div className="flex z-10 overflow-y-auto h-screen items-center w-[59.75%]  ">
                {children}
            </div>
        </div>

    );
}

function AuthPageCards({ imgUrl, imgHeight, imgWidth, text1, text2 }) {
    return (
        <div className="flex gap-6 items-center" >
            <div className="bg-white w-[72px] h-[72px] rounded-lg flex items-center justify-center ">
                <Image src={`/auth/${imgUrl}.svg`} alt={imgUrl} width={imgWidth} height={imgHeight} />
            </div>
            <p className="flex flex-col  text-white ">
                <span className="text-[27.6px] font-bold">{text1}</span>
                <span className="text-[20px]">{text2}</span>
            </p>
        </div>
    )
}