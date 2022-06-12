import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Group } from '@vx/group'
import { hierarchy, Tree } from '@vx/hierarchy'
import { LinearGradient } from '@vx/gradient'
import { pointRadial } from 'd3-shape'
import getLinkComponent from './component/getLinkComponent'
import UploadComponent from './component/uploadComponent'
import classes from './App.module.css'

import { useResize } from './hook/useResize'
import useForceUpdate from './hook/useForceUpdate'

interface TreeNode {
  name: string
  isExpanded?: boolean
  isEdited?: boolean
  _id?: string
  children?: TreeNode[]
}

const originData = {
  type: {
    product: {
      enterprise: {
        category: {
          setting: {
            period: {
              type: 'integer',
              enum: [30, 365],
            },
          },
          service_setting: {
            template: {
              type: 'integer',
              default: 10,
              maximun: 50,
              minimum: 5,
            },
          },
        },
      },
    },
  },
}

type JsonTransFormTreeNode = {
  (data: object): Array<TreeNode>
}

const jsonTransFormTreeNode: JsonTransFormTreeNode = (data) => {
  return Object.entries(data).map(([key, val]) => {
    if (Object.prototype.toString.call(val) === `[object Object]`) {
      return {
        name: key,
        _id: uuidv4(),
        children: jsonTransFormTreeNode(val),
      }
    }
    if (Array.isArray(val)) {
      return {
        name: key,
        _id: uuidv4(),
        children: val.map((v) => ({
          name: v + '',
          _id: uuidv4(),
        })),
      }
    }
    return {
      name: key,
      _id: uuidv4(),
      children: [
        {
          name: val + '',
          _id: uuidv4(),
        },
      ],
    }
  })
}

const data: TreeNode = {
  name: 'Main',
  children: jsonTransFormTreeNode(originData),
}

const defaultMargin = { top: 80, left: 80, right: 80, bottom: 100 }

export type LinkTypesProps = {
  margin?: { top: number; right: number; bottom: number; left: number }
}

export default function ({ margin = defaultMargin }: LinkTypesProps) {
  const [currentEditing, setCurrentEditing] = useState<string>('')
  const [layout] = useState<string>('cartesian')
  const [orientation] = useState<string>('horizontal')
  const [linkType] = useState<string>('diagonal')
  const [stepPercent] = useState<number>(0.1)
  const forceUpdate = useForceUpdate()

  const { windowHeight: totalHeight, windowWidth: totalWidth } = useResize()

  const innerWidth = totalWidth - margin.left - margin.right
  const innerHeight = totalHeight - margin.top - margin.bottom

  let origin: { x: number; y: number }
  let sizeWidth: number
  let sizeHeight: number

  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2,
      y: innerHeight / 2,
    }
    sizeWidth = 2 * Math.PI
    sizeHeight = Math.min(innerWidth, innerHeight) / 2
  } else {
    origin = { x: 0, y: 0 }
    if (orientation === 'vertical') {
      sizeWidth = innerWidth
      sizeHeight = innerHeight
    } else {
      sizeWidth = innerHeight
      sizeHeight = innerWidth
    }
  }

  const LinkComponent = getLinkComponent({ layout, linkType, orientation })

  return totalWidth < 10 ? null : (
    <div>
      <UploadComponent></UploadComponent>
      <svg width={totalWidth} height={totalHeight}>
        <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={hierarchy(data, (d) => (d.isExpanded ? null : d.children))}
            size={[sizeWidth, sizeHeight]}
            separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
          >
            {(tree) => (
              <Group top={origin.y} left={origin.x}>
                {tree.links().map((link, i) => (
                  <LinkComponent
                    key={i}
                    data={link}
                    percent={stepPercent}
                    stroke="rgb(254,110,158,0.6)"
                    strokeWidth="1"
                    fill="none"
                  />
                ))}

                {tree.descendants().map((node, key) => {
                  const width = 80
                  const height = 40

                  let top: number
                  let left: number
                  if (layout === 'polar') {
                    const [radialX, radialY] = pointRadial(node.x, node.y)
                    top = radialY
                    left = radialX
                  } else if (orientation === 'vertical') {
                    top = node.y
                    left = node.x
                  } else {
                    top = node.x
                    left = node.y
                  }

                  return (
                    <Group top={top} left={left} key={key}>
                      {node.depth === 0 && (
                        <circle
                          r={12}
                          fill="url('#links-gradient')"
                          onClick={() => {
                            node.data.isExpanded = !node.data.isExpanded
                            console.log(node)
                            forceUpdate()
                          }}
                        />
                      )}
                      {node.depth !== 0 && (
                        <rect
                          height={height}
                          width={width}
                          y={-height / 2}
                          x={-width / 2}
                          fill="#272b4d"
                          stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                          strokeWidth={1}
                          strokeDasharray={node.data.children ? '0' : '2,2'}
                          strokeOpacity={node.data.children ? 1 : 0.6}
                          rx={node.data.children ? 0 : 10}
                          onClick={() => {
                            node.data.children && (node.data.isExpanded = !node.data.isExpanded)
                            !node.data.children && setCurrentEditing(node.data._id || '')
                            forceUpdate()
                          }}
                        />
                      )}
                      {!node.data.children && currentEditing === node.data._id && (
                        <foreignObject x={-width / 2} y={-height / 2} width={width} height={height}>
                          <input
                            className={classes.treeNodeInput}
                            value={node.data.name}
                            onChange={(e) => {
                              node.data.name = e.target.value
                              forceUpdate()
                            }}
                          ></input>
                        </foreignObject>
                      )}
                      {(node.data.children || currentEditing !== node.data._id) && (
                        <text
                          dy=".33em"
                          fontSize={9}
                          fontFamily="Arial"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none' }}
                          fill={node.depth === 0 ? '#71248e' : node.children ? 'white' : '#26deb0'}
                        >
                          {node.data.name}
                        </text>
                      )}
                    </Group>
                  )
                })}
              </Group>
            )}
          </Tree>
        </Group>
      </svg>
    </div>
  )
}
