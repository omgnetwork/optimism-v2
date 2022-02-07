import * as React from "react"

function EthereumIcon({ active }) {

  if (active) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="30" rx="8" fill="#5B78ED" />
        <path d="M14.7514 4L14.6038 4.50135V19.0481L14.7514 19.1953L21.5037 15.204L14.7514 4Z" fill="#E5E7EB" />
        <path d="M14.7525 4L8 15.204L14.7525 19.1953V12.1348V4Z" fill="#F9F9FA" />
        <path d="M14.7514 20.4737L14.6682 20.5752V25.7569L14.7514 25.9998L21.5078 16.4844L14.7514 20.4737Z" fill="#E5E7EB" />
        <path d="M14.7525 25.9998V20.4737L8 16.4844L14.7525 25.9998Z" fill="#F9F9FA" />
        <path d="M14.7515 19.1951L21.5038 15.2038L14.7515 12.1345V19.1951Z" fill="#D2D5DA" />
        <path d="M8 15.2038L14.7525 19.1951V12.1345L8 15.2038Z" fill="#E5E7EB" />
      </svg>
    )
  }
  
  return (<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="-0.00012207" width="30" height="30" rx="8" fill="white" fill-opacity="0.15" />
    <path d="M14.7512 4L14.6036 4.50135V19.0481L14.7512 19.1953L21.5035 15.204L14.7512 4Z" fill="#E5E7EB" />
    <path d="M14.7524 4L7.99988 15.204L14.7524 19.1953V12.1348V4Z" fill="#F9F9FA" />
    <path d="M14.7513 20.4737L14.6681 20.5752V25.7569L14.7513 25.9998L21.5077 16.4844L14.7513 20.4737Z" fill="#E5E7EB" />
    <path d="M14.7524 25.9998V20.4737L7.99988 16.4844L14.7524 25.9998Z" fill="#F9F9FA" />
    <path d="M14.7513 19.1951L21.5036 15.2038L14.7513 12.1345V19.1951Z" fill="#D2D5DA" />
    <path d="M7.99988 15.2038L14.7524 19.1951V12.1345L7.99988 15.2038Z" fill="#E5E7EB" />
  </svg>
  )
}

export default EthereumIcon
