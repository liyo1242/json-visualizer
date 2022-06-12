import type { RadioChangeEvent } from 'antd'
import { Radio } from 'antd'
import React, { useRef, useState } from 'react'
import classes from './uploadComponent.module.css'

const UploadComponent: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [inputType, setInputType] = useState('file')
  const [textareaContent, setTextareaContent] = useState<string>('')

  const reader = new FileReader()

  const onRadioTypeChange = (e: RadioChangeEvent) => {
    setInputType(e.target.value)
  }

  const onFileChange = () => {
    if (fileRef.current) {
      if (!fileRef.current.value.length || !fileRef.current.files) return
      reader.readAsText(fileRef.current.files[0])
    }
  }

  const onFileReaderOnload = (event: Event) => {
    const target = event.target as FileReader
    if (typeof target.result === 'string') setTextareaContent(target.result)
    // * Leave parse data work to display comp
    // * If failed convert json file, should display error message at svg
  }

  reader.onload = onFileReaderOnload

  return (
    <div className={classes.uploadFileContainer}>
      <h3>Choose Input Type</h3>
      <div className={classes.uploadFileRadio}>
        <Radio.Group onChange={onRadioTypeChange} value={inputType}>
          <Radio value={'file'}>file</Radio>
          <Radio value={'text'}>text</Radio>
        </Radio.Group>
      </div>
      <div className={classes.uploadFileInput}>
        {inputType === 'file' && (
          <input ref={fileRef} type="file" accept=".json" onChange={onFileChange}></input>
        )}
        {inputType === 'text' && <textarea value={textareaContent}></textarea>}
      </div>
    </div>
  )
}

export default UploadComponent
