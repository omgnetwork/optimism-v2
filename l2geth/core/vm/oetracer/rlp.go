// Copyright (c) 2022 DeBank Inc. <admin@debank.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

package oetracer

import (
  "io"
  "math/big"

  "github.com/ethereum-optimism/optimism/l2geth/common"
  "github.com/ethereum-optimism/optimism/l2geth/common/hexutil"

  "github.com/ethereum/go-ethereum/rlp"
)

type flatTrace struct {
  // Action fields
  ActionCallType      *string         `rlp:"nil"`
  ActionFrom          *common.Address `rlp:"nil"`
  ActionTo            *common.Address `rlp:"nil"`
  ActionValue         big.Int
  ActionGas           uint64
  ActionInit          []byte
  ActionInput         []byte
  ActionAddress       *common.Address `rlp:"nil"`
  ActionRefundAddress *common.Address `rlp:"nil"`
  ActionBalance       *big.Int        `rlp:"nil"`
  // Result fields
  ResultGasUsed uint64
  ResultOutput  []byte
  ResultCode    []byte
  ResultAddress *common.Address `rlp:"nil"`
  // Other fields
  Error        string
  Subtraces    uint64
  TraceAddress []uint32
  TraceType    string
}

type ActionTraces []ActionTrace

func (traces *ActionTraces) EncodeRLP(w io.Writer) error {
  cpy := make([][]byte, 0, len(*traces))
  for _, t := range *traces {
    bs, err := rlp.EncodeToBytes(&t)
    if err != nil {
      return err
    }
    cpy = append(cpy, bs)
  }
  return rlp.Encode(w, &cpy)
}

func (traces *ActionTraces) DecodeRLP(s *rlp.Stream) error {
  raw := make([][]byte, 0)
  if err := s.Decode(&raw); err != nil {
    return err
  }
  cpy := make([]ActionTrace, 0, len(raw))
  for _, bs := range raw {
    at := new(ActionTrace)
    err := rlp.DecodeBytes(bs, at)
    if err != nil {
      return err
    }
    cpy = append(cpy, *at)
  }
  *traces = cpy
  return nil
}

// EncodeRLP serializes ActionTrace into the Ethereum RLP flatTrace format.
func (at *ActionTrace) EncodeRLP(w io.Writer) error {
  ft := &flatTrace{
    ActionCallType:      at.Action.CallType,
    ActionFrom:          at.Action.From,
    ActionTo:            at.Action.To,
    ActionValue:         *at.Action.Value.ToInt(),
    ActionGas:           uint64(at.Action.Gas),
    ActionInit:          at.Action.Init,
    ActionInput:         at.Action.Input,
    ActionAddress:       at.Action.Address,
    ActionRefundAddress: at.Action.RefundAddress,
    ActionBalance:       at.Action.Balance.ToInt(),
    Error:               at.Error,
    Subtraces:           at.Subtraces,
    TraceAddress:        at.TraceAddress,
    TraceType:           at.TraceType,
  }
  if at.Result != nil {
    ft.ResultGasUsed = uint64(at.Result.GasUsed)
    if at.Result.Output != nil {
      ft.ResultOutput = *at.Result.Output
    }
    ft.ResultCode = at.Result.Code
    ft.ResultAddress = at.Result.Address
  }
  return rlp.Encode(w, ft)
}

// DecodeRLP Decodes the Ethereum RLP flatTrace.
func (at *ActionTrace) DecodeRLP(s *rlp.Stream) error {
  var ft flatTrace
  if err := s.Decode(&ft); err != nil {
    return err
  }

  action := AddressAction{
    CallType:      ft.ActionCallType,
    From:          ft.ActionFrom,
    To:            ft.ActionTo,
    Value:         hexutil.Big(ft.ActionValue),
    Gas:           hexutil.Uint64(ft.ActionGas),
    Init:          ft.ActionInit,
    Input:         ft.ActionInput,
    Address:       ft.ActionAddress,
    RefundAddress: ft.ActionRefundAddress,
    Balance:       (*hexutil.Big)(ft.ActionBalance),
  }
  result := &TraceActionResult{
    GasUsed: hexutil.Uint64(ft.ResultGasUsed),
    Code:    ft.ResultCode,
    Address: ft.ResultAddress,
  }
  if ft.ResultOutput != nil {
    output := hexutil.Bytes(ft.ResultOutput)
    result.Output = &output
  }

  // Set unrelated filed to nil explicitly for json decode omit.
  switch ft.TraceType {
  case CALL:
    action.Balance = nil
    result.Code = nil
  case CREATE:
    action.Balance = nil
    result.Output = nil
  case SELFDESTRUCT:
    result = nil
  default:
  }

  at.Action, at.Error, at.Subtraces, at.TraceAddress, at.TraceType = action, ft.Error, ft.Subtraces, ft.TraceAddress, ft.TraceType
  if at.Error == "" { // only succeeded trace has result filed
    at.Result = result
  }
  return nil
}
