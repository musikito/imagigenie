"use client";

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils';
import { CldImage, getCldImageUrl } from 'next-cloudinary';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import React from 'react';

const TransformedImage = (
    { image, title, type, isTransforming, setIsTransforming, transformationConfig, hasDownload = false }: TransformedImageProps
) => {

    /**
     * Handles the download of the transformed image.
     *
     * @param e - The click event object for the download button.
     * @returns void
     */
    const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        download(getCldImageUrl({
            width: image?.width,
            height: image?.height,
            src: image?.publicId,
            ...transformationConfig
        }), title);

    };
    return (
        <div className="flex flex-col gap-4">
            <div className="flex-between">
                <h3 className="h3-bold">Transformed</h3>
                {hasDownload && (
                    <button
                        className="download-btn" onClick={downloadHandler}>
                        <Image
                            src="/assets/icons/download.svg"
                            alt="Download"
                            width={24}
                            height={24}
                            className="pb-[6px]"
                        />
                    </button>
                )}
            </div>
            {/** Is transforming */}
            {image?.publicId && transformationConfig ? (
                <div className="relative">
                    <CldImage
                        width={getImageSize(type, image, "width")}
                        height={getImageSize(type, image, "height")}
                        src={image?.publicId}
                        alt={image?.title}
                        sizes={"(max-width: 768px) 100vw, 50vw"}
                        placeholder={dataUrl as PlaceholderValue}
                        className="transformed-image"
                        onLoad={() => {
                            setIsTransforming && setIsTransforming(false);
                        }}
                        onError={() => {
                            debounce(() => {
                                setIsTransforming && setIsTransforming(false);
                            }, 8000)()
                        }}
                        {...transformationConfig}
                    />
                    {isTransforming && (
                        <div className="transforming-loader">
                            <Image
                                src="/assets/icons/spinner.svg"
                                alt="Spinner"
                                width={50}
                                height={50}
                            />
                            <p className="text-whit/80">Please wait...</p>
                        </div>
                    )}

                </div>
            ) : (
                <div className="transformed-placeholder">
                    Transformed Image
                </div>
            )}

        </div>
    );
};

export default TransformedImage;