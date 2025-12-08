import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Img from '../components/Image';

let showImageFn;

export const openImage = (src) => {
    if (showImageFn) showImageFn(src);
};

const ImagePortalManager = () => {
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        // Assign the global function
        showImageFn = setImageSrc;
        return () => {
            showImageFn = null; // cleanup
        };
    }, []);

    if (!imageSrc) return null;

    return createPortal(
        <div
            className="fixed top-0 left-0 w-full h-screen flex items-center justify-center backdrop-blur-sm z-50"
            onClick={() => setImageSrc(null)}
        >
            <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
            >
                <Img style={"bg-[var(--accent-color)]  w-100 rounded object-contain border-2 border-[var(--primary-color)]"} src={imageSrc} />
                <X
                    className="absolute top-4 rounded border border-gray-300 right-4 cursor-pointer bg-white  text-black"
                    size={24}
                    onClick={() => setImageSrc(null)}
                />
            </div>
        </div>,
        document.body
    );
};

export default ImagePortalManager;
