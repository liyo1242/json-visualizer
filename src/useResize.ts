import { useState, useEffect } from 'react'

export const useResize = () => {
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight)

    const handleResize = () => {
        setWindowWidth(window.innerWidth)
        setWindowHeight(window.innerHeight)
    }

    useEffect(() => {
        window.onresize = handleResize

        return () => { window.onresize = null }
    }, [])

    return {
        windowWidth, windowHeight
    }
}