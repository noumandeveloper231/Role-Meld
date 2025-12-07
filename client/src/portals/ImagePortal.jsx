import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Img from '../components/Image';

const ImagePortal = (src, show, setShow) => {
    return createPortal(
        <div className={`${!show && "hidden"} fixed top-0 left-0 w-full h-screen flex items-center justify-center backdrop-blur-sm transition-all duration-300`}>
            <div className='relative'>
                <Img src={src} />
                <X className='absolute top-4 right-4 cursor-pointer' onClick={() => setShow(false)} />
            </div>
        </div>,
        document.body
    );
};

export default ImagePortal;
