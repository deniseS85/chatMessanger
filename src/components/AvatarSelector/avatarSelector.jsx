import React, { useState, useEffect } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';
import styles from './avatarSelector.module.scss';

const AvatarSelector = ({ onSelect }) => {
    const [avatarSize, setAvatarSize] = useState(80);

    useEffect(() => {
        const handleResize = () => {
            const newSize = Math.min(window.innerWidth * 0.18, 80);
            setAvatarSize(newSize);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const avatarOptions = [
        genConfig({ sex: 'man', hairStyle: 'normal', clothingStyle: 'casual' }),
        genConfig({ sex: 'woman', hairStyle: 'womanLong', clothingStyle: 'formal' }),
        genConfig({ sex: 'man', hairStyle: 'thick', glassesStyle: 'round', accessory: 'hat' }),
        genConfig({ sex: 'woman', hairStyle: 'womanShort', glassesStyle: 'square' }),
        genConfig({ sex: 'man', hairStyle: 'mohawk', clothingStyle: 'sportswear' }),
        genConfig({ sex: 'woman', hairStyle: 'normal', accessory: 'headphones' }),
        genConfig({ sex: 'man', hairStyle: 'normal', glassesStyle: 'round' }),
        genConfig({ sex: 'woman', hairStyle: 'womanLong', clothingStyle: 'casual', accessory: 'earrings' }),
        genConfig({ sex: 'man', hairStyle: 'thick', clothingStyle: 'formal', glassesStyle: 'square' }),
        genConfig({ sex: 'woman', hairStyle: 'womanShort', glassesStyle: 'none', accessory: 'scarf' }),
        genConfig({ sex: 'man', hairStyle: 'mohawk', glassesStyle: 'round' }),
        genConfig({ sex: 'woman', hairStyle: 'normal', clothingStyle: 'sportswear', accessory: 'headband' })
    ];

    return (
        <div className={styles.avatarOptions}>
            {avatarOptions.map((config, index) => (
                <div 
                    key={index} 
                    className={styles.avatarOption}
                    onClick={() => onSelect(config)}
                    style={{ 
                        width: avatarSize, 
                        height: avatarSize, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}
                >
                    <Avatar style={{ width: avatarSize * 0.8, height: avatarSize * 0.8 }} {...config} />
                </div>
            ))}
        </div>
    );
};

export default AvatarSelector;
