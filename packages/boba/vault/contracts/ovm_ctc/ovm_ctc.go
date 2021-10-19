// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package ovm_ctc

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// Lib_OVMCodecQueueElement is an auto generated low-level Go binding around an user-defined struct.
type Lib_OVMCodecQueueElement struct {
	TransactionHash [32]byte
	Timestamp       *big.Int
	BlockNumber     *big.Int
}

// OvmCtcABI is the input ABI used to generate the binding from.
const OvmCtcABI = "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_libAddressManager\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_maxTransactionGasLimit\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_l2GasDiscountDivisor\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_enqueueGasCost\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"l2GasDiscountDivisor\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"enqueueGasCost\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"enqueueL2GasPrepaid\",\"type\":\"uint256\"}],\"name\":\"L2GasParamsUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_startingQueueIndex\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_numQueueElements\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_totalElements\",\"type\":\"uint256\"}],\"name\":\"QueueBatchAppended\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_startingQueueIndex\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_numQueueElements\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_totalElements\",\"type\":\"uint256\"}],\"name\":\"SequencerBatchAppended\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"_batchIndex\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"_batchRoot\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_batchSize\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_prevTotalElements\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"_extraData\",\"type\":\"bytes\"}],\"name\":\"TransactionBatchAppended\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_l1TxOrigin\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_target\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_gasLimit\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"_data\",\"type\":\"bytes\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"_queueIndex\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_timestamp\",\"type\":\"uint256\"}],\"name\":\"TransactionEnqueued\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"MAX_ROLLUP_TX_SIZE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MIN_ROLLUP_TX_GAS\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"appendSequencerBatch\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"batches\",\"outputs\":[{\"internalType\":\"contractIChainStorageContainer\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_target\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_gasLimit\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"_data\",\"type\":\"bytes\"}],\"name\":\"enqueue\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"enqueueGasCost\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"enqueueL2GasPrepaid\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getLastBlockNumber\",\"outputs\":[{\"internalType\":\"uint40\",\"name\":\"\",\"type\":\"uint40\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getLastTimestamp\",\"outputs\":[{\"internalType\":\"uint40\",\"name\":\"\",\"type\":\"uint40\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getNextQueueIndex\",\"outputs\":[{\"internalType\":\"uint40\",\"name\":\"\",\"type\":\"uint40\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getNumPendingQueueElements\",\"outputs\":[{\"internalType\":\"uint40\",\"name\":\"\",\"type\":\"uint40\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"getQueueElement\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"transactionHash\",\"type\":\"bytes32\"},{\"internalType\":\"uint40\",\"name\":\"timestamp\",\"type\":\"uint40\"},{\"internalType\":\"uint40\",\"name\":\"blockNumber\",\"type\":\"uint40\"}],\"internalType\":\"structLib_OVMCodec.QueueElement\",\"name\":\"_element\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getQueueLength\",\"outputs\":[{\"internalType\":\"uint40\",\"name\":\"\",\"type\":\"uint40\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getTotalBatches\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"_totalBatches\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getTotalElements\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"_totalElements\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"l2GasDiscountDivisor\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"libAddressManager\",\"outputs\":[{\"internalType\":\"contractLib_AddressManager\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"maxTransactionGasLimit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"queue\",\"outputs\":[{\"internalType\":\"contractIChainStorageContainer\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_name\",\"type\":\"string\"}],\"name\":\"resolve\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_l2GasDiscountDivisor\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_enqueueGasCost\",\"type\":\"uint256\"}],\"name\":\"setGasParams\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"

// OvmCtc is an auto generated Go binding around an Ethereum contract.
type OvmCtc struct {
	OvmCtcCaller     // Read-only binding to the contract
	OvmCtcTransactor // Write-only binding to the contract
	OvmCtcFilterer   // Log filterer for contract events
}

// OvmCtcCaller is an auto generated read-only Go binding around an Ethereum contract.
type OvmCtcCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OvmCtcTransactor is an auto generated write-only Go binding around an Ethereum contract.
type OvmCtcTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OvmCtcFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type OvmCtcFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// OvmCtcSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type OvmCtcSession struct {
	Contract     *OvmCtc           // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// OvmCtcCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type OvmCtcCallerSession struct {
	Contract *OvmCtcCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// OvmCtcTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type OvmCtcTransactorSession struct {
	Contract     *OvmCtcTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// OvmCtcRaw is an auto generated low-level Go binding around an Ethereum contract.
type OvmCtcRaw struct {
	Contract *OvmCtc // Generic contract binding to access the raw methods on
}

// OvmCtcCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type OvmCtcCallerRaw struct {
	Contract *OvmCtcCaller // Generic read-only contract binding to access the raw methods on
}

// OvmCtcTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type OvmCtcTransactorRaw struct {
	Contract *OvmCtcTransactor // Generic write-only contract binding to access the raw methods on
}

// NewOvmCtc creates a new instance of OvmCtc, bound to a specific deployed contract.
func NewOvmCtc(address common.Address, backend bind.ContractBackend) (*OvmCtc, error) {
	contract, err := bindOvmCtc(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &OvmCtc{OvmCtcCaller: OvmCtcCaller{contract: contract}, OvmCtcTransactor: OvmCtcTransactor{contract: contract}, OvmCtcFilterer: OvmCtcFilterer{contract: contract}}, nil
}

// NewOvmCtcCaller creates a new read-only instance of OvmCtc, bound to a specific deployed contract.
func NewOvmCtcCaller(address common.Address, caller bind.ContractCaller) (*OvmCtcCaller, error) {
	contract, err := bindOvmCtc(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &OvmCtcCaller{contract: contract}, nil
}

// NewOvmCtcTransactor creates a new write-only instance of OvmCtc, bound to a specific deployed contract.
func NewOvmCtcTransactor(address common.Address, transactor bind.ContractTransactor) (*OvmCtcTransactor, error) {
	contract, err := bindOvmCtc(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &OvmCtcTransactor{contract: contract}, nil
}

// NewOvmCtcFilterer creates a new log filterer instance of OvmCtc, bound to a specific deployed contract.
func NewOvmCtcFilterer(address common.Address, filterer bind.ContractFilterer) (*OvmCtcFilterer, error) {
	contract, err := bindOvmCtc(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &OvmCtcFilterer{contract: contract}, nil
}

// bindOvmCtc binds a generic wrapper to an already deployed contract.
func bindOvmCtc(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(OvmCtcABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_OvmCtc *OvmCtcRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _OvmCtc.Contract.OvmCtcCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_OvmCtc *OvmCtcRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _OvmCtc.Contract.OvmCtcTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_OvmCtc *OvmCtcRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _OvmCtc.Contract.OvmCtcTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_OvmCtc *OvmCtcCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _OvmCtc.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_OvmCtc *OvmCtcTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _OvmCtc.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_OvmCtc *OvmCtcTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _OvmCtc.Contract.contract.Transact(opts, method, params...)
}

// MAXROLLUPTXSIZE is a free data retrieval call binding the contract method 0x876ed5cb.
//
// Solidity: function MAX_ROLLUP_TX_SIZE() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) MAXROLLUPTXSIZE(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "MAX_ROLLUP_TX_SIZE")
	return *ret0, err
}

// MAXROLLUPTXSIZE is a free data retrieval call binding the contract method 0x876ed5cb.
//
// Solidity: function MAX_ROLLUP_TX_SIZE() view returns(uint256)
func (_OvmCtc *OvmCtcSession) MAXROLLUPTXSIZE() (*big.Int, error) {
	return _OvmCtc.Contract.MAXROLLUPTXSIZE(&_OvmCtc.CallOpts)
}

// MAXROLLUPTXSIZE is a free data retrieval call binding the contract method 0x876ed5cb.
//
// Solidity: function MAX_ROLLUP_TX_SIZE() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) MAXROLLUPTXSIZE() (*big.Int, error) {
	return _OvmCtc.Contract.MAXROLLUPTXSIZE(&_OvmCtc.CallOpts)
}

// MINROLLUPTXGAS is a free data retrieval call binding the contract method 0x78f4b2f2.
//
// Solidity: function MIN_ROLLUP_TX_GAS() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) MINROLLUPTXGAS(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "MIN_ROLLUP_TX_GAS")
	return *ret0, err
}

// MINROLLUPTXGAS is a free data retrieval call binding the contract method 0x78f4b2f2.
//
// Solidity: function MIN_ROLLUP_TX_GAS() view returns(uint256)
func (_OvmCtc *OvmCtcSession) MINROLLUPTXGAS() (*big.Int, error) {
	return _OvmCtc.Contract.MINROLLUPTXGAS(&_OvmCtc.CallOpts)
}

// MINROLLUPTXGAS is a free data retrieval call binding the contract method 0x78f4b2f2.
//
// Solidity: function MIN_ROLLUP_TX_GAS() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) MINROLLUPTXGAS() (*big.Int, error) {
	return _OvmCtc.Contract.MINROLLUPTXGAS(&_OvmCtc.CallOpts)
}

// Batches is a free data retrieval call binding the contract method 0xcfdf677e.
//
// Solidity: function batches() view returns(address)
func (_OvmCtc *OvmCtcCaller) Batches(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "batches")
	return *ret0, err
}

// Batches is a free data retrieval call binding the contract method 0xcfdf677e.
//
// Solidity: function batches() view returns(address)
func (_OvmCtc *OvmCtcSession) Batches() (common.Address, error) {
	return _OvmCtc.Contract.Batches(&_OvmCtc.CallOpts)
}

// Batches is a free data retrieval call binding the contract method 0xcfdf677e.
//
// Solidity: function batches() view returns(address)
func (_OvmCtc *OvmCtcCallerSession) Batches() (common.Address, error) {
	return _OvmCtc.Contract.Batches(&_OvmCtc.CallOpts)
}

// EnqueueGasCost is a free data retrieval call binding the contract method 0xe654b1fb.
//
// Solidity: function enqueueGasCost() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) EnqueueGasCost(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "enqueueGasCost")
	return *ret0, err
}

// EnqueueGasCost is a free data retrieval call binding the contract method 0xe654b1fb.
//
// Solidity: function enqueueGasCost() view returns(uint256)
func (_OvmCtc *OvmCtcSession) EnqueueGasCost() (*big.Int, error) {
	return _OvmCtc.Contract.EnqueueGasCost(&_OvmCtc.CallOpts)
}

// EnqueueGasCost is a free data retrieval call binding the contract method 0xe654b1fb.
//
// Solidity: function enqueueGasCost() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) EnqueueGasCost() (*big.Int, error) {
	return _OvmCtc.Contract.EnqueueGasCost(&_OvmCtc.CallOpts)
}

// EnqueueL2GasPrepaid is a free data retrieval call binding the contract method 0x0b3dfa97.
//
// Solidity: function enqueueL2GasPrepaid() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) EnqueueL2GasPrepaid(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "enqueueL2GasPrepaid")
	return *ret0, err
}

// EnqueueL2GasPrepaid is a free data retrieval call binding the contract method 0x0b3dfa97.
//
// Solidity: function enqueueL2GasPrepaid() view returns(uint256)
func (_OvmCtc *OvmCtcSession) EnqueueL2GasPrepaid() (*big.Int, error) {
	return _OvmCtc.Contract.EnqueueL2GasPrepaid(&_OvmCtc.CallOpts)
}

// EnqueueL2GasPrepaid is a free data retrieval call binding the contract method 0x0b3dfa97.
//
// Solidity: function enqueueL2GasPrepaid() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) EnqueueL2GasPrepaid() (*big.Int, error) {
	return _OvmCtc.Contract.EnqueueL2GasPrepaid(&_OvmCtc.CallOpts)
}

// GetLastBlockNumber is a free data retrieval call binding the contract method 0x5ae6256d.
//
// Solidity: function getLastBlockNumber() view returns(uint40)
func (_OvmCtc *OvmCtcCaller) GetLastBlockNumber(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getLastBlockNumber")
	return *ret0, err
}

// GetLastBlockNumber is a free data retrieval call binding the contract method 0x5ae6256d.
//
// Solidity: function getLastBlockNumber() view returns(uint40)
func (_OvmCtc *OvmCtcSession) GetLastBlockNumber() (*big.Int, error) {
	return _OvmCtc.Contract.GetLastBlockNumber(&_OvmCtc.CallOpts)
}

// GetLastBlockNumber is a free data retrieval call binding the contract method 0x5ae6256d.
//
// Solidity: function getLastBlockNumber() view returns(uint40)
func (_OvmCtc *OvmCtcCallerSession) GetLastBlockNumber() (*big.Int, error) {
	return _OvmCtc.Contract.GetLastBlockNumber(&_OvmCtc.CallOpts)
}

// GetLastTimestamp is a free data retrieval call binding the contract method 0x37899770.
//
// Solidity: function getLastTimestamp() view returns(uint40)
func (_OvmCtc *OvmCtcCaller) GetLastTimestamp(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getLastTimestamp")
	return *ret0, err
}

// GetLastTimestamp is a free data retrieval call binding the contract method 0x37899770.
//
// Solidity: function getLastTimestamp() view returns(uint40)
func (_OvmCtc *OvmCtcSession) GetLastTimestamp() (*big.Int, error) {
	return _OvmCtc.Contract.GetLastTimestamp(&_OvmCtc.CallOpts)
}

// GetLastTimestamp is a free data retrieval call binding the contract method 0x37899770.
//
// Solidity: function getLastTimestamp() view returns(uint40)
func (_OvmCtc *OvmCtcCallerSession) GetLastTimestamp() (*big.Int, error) {
	return _OvmCtc.Contract.GetLastTimestamp(&_OvmCtc.CallOpts)
}

// GetNextQueueIndex is a free data retrieval call binding the contract method 0x7a167a8a.
//
// Solidity: function getNextQueueIndex() view returns(uint40)
func (_OvmCtc *OvmCtcCaller) GetNextQueueIndex(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getNextQueueIndex")
	return *ret0, err
}

// GetNextQueueIndex is a free data retrieval call binding the contract method 0x7a167a8a.
//
// Solidity: function getNextQueueIndex() view returns(uint40)
func (_OvmCtc *OvmCtcSession) GetNextQueueIndex() (*big.Int, error) {
	return _OvmCtc.Contract.GetNextQueueIndex(&_OvmCtc.CallOpts)
}

// GetNextQueueIndex is a free data retrieval call binding the contract method 0x7a167a8a.
//
// Solidity: function getNextQueueIndex() view returns(uint40)
func (_OvmCtc *OvmCtcCallerSession) GetNextQueueIndex() (*big.Int, error) {
	return _OvmCtc.Contract.GetNextQueueIndex(&_OvmCtc.CallOpts)
}

// GetNumPendingQueueElements is a free data retrieval call binding the contract method 0xf722b41a.
//
// Solidity: function getNumPendingQueueElements() view returns(uint40)
func (_OvmCtc *OvmCtcCaller) GetNumPendingQueueElements(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getNumPendingQueueElements")
	return *ret0, err
}

// GetNumPendingQueueElements is a free data retrieval call binding the contract method 0xf722b41a.
//
// Solidity: function getNumPendingQueueElements() view returns(uint40)
func (_OvmCtc *OvmCtcSession) GetNumPendingQueueElements() (*big.Int, error) {
	return _OvmCtc.Contract.GetNumPendingQueueElements(&_OvmCtc.CallOpts)
}

// GetNumPendingQueueElements is a free data retrieval call binding the contract method 0xf722b41a.
//
// Solidity: function getNumPendingQueueElements() view returns(uint40)
func (_OvmCtc *OvmCtcCallerSession) GetNumPendingQueueElements() (*big.Int, error) {
	return _OvmCtc.Contract.GetNumPendingQueueElements(&_OvmCtc.CallOpts)
}

// GetQueueElement is a free data retrieval call binding the contract method 0x2a7f18be.
//
// Solidity: function getQueueElement(uint256 _index) view returns((bytes32,uint40,uint40) _element)
func (_OvmCtc *OvmCtcCaller) GetQueueElement(opts *bind.CallOpts, _index *big.Int) (Lib_OVMCodecQueueElement, error) {
	var (
		ret0 = new(Lib_OVMCodecQueueElement)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getQueueElement", _index)
	return *ret0, err
}

// GetQueueElement is a free data retrieval call binding the contract method 0x2a7f18be.
//
// Solidity: function getQueueElement(uint256 _index) view returns((bytes32,uint40,uint40) _element)
func (_OvmCtc *OvmCtcSession) GetQueueElement(_index *big.Int) (Lib_OVMCodecQueueElement, error) {
	return _OvmCtc.Contract.GetQueueElement(&_OvmCtc.CallOpts, _index)
}

// GetQueueElement is a free data retrieval call binding the contract method 0x2a7f18be.
//
// Solidity: function getQueueElement(uint256 _index) view returns((bytes32,uint40,uint40) _element)
func (_OvmCtc *OvmCtcCallerSession) GetQueueElement(_index *big.Int) (Lib_OVMCodecQueueElement, error) {
	return _OvmCtc.Contract.GetQueueElement(&_OvmCtc.CallOpts, _index)
}

// GetQueueLength is a free data retrieval call binding the contract method 0xb8f77005.
//
// Solidity: function getQueueLength() view returns(uint40)
func (_OvmCtc *OvmCtcCaller) GetQueueLength(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getQueueLength")
	return *ret0, err
}

// GetQueueLength is a free data retrieval call binding the contract method 0xb8f77005.
//
// Solidity: function getQueueLength() view returns(uint40)
func (_OvmCtc *OvmCtcSession) GetQueueLength() (*big.Int, error) {
	return _OvmCtc.Contract.GetQueueLength(&_OvmCtc.CallOpts)
}

// GetQueueLength is a free data retrieval call binding the contract method 0xb8f77005.
//
// Solidity: function getQueueLength() view returns(uint40)
func (_OvmCtc *OvmCtcCallerSession) GetQueueLength() (*big.Int, error) {
	return _OvmCtc.Contract.GetQueueLength(&_OvmCtc.CallOpts)
}

// GetTotalBatches is a free data retrieval call binding the contract method 0xe561dddc.
//
// Solidity: function getTotalBatches() view returns(uint256 _totalBatches)
func (_OvmCtc *OvmCtcCaller) GetTotalBatches(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getTotalBatches")
	return *ret0, err
}

// GetTotalBatches is a free data retrieval call binding the contract method 0xe561dddc.
//
// Solidity: function getTotalBatches() view returns(uint256 _totalBatches)
func (_OvmCtc *OvmCtcSession) GetTotalBatches() (*big.Int, error) {
	return _OvmCtc.Contract.GetTotalBatches(&_OvmCtc.CallOpts)
}

// GetTotalBatches is a free data retrieval call binding the contract method 0xe561dddc.
//
// Solidity: function getTotalBatches() view returns(uint256 _totalBatches)
func (_OvmCtc *OvmCtcCallerSession) GetTotalBatches() (*big.Int, error) {
	return _OvmCtc.Contract.GetTotalBatches(&_OvmCtc.CallOpts)
}

// GetTotalElements is a free data retrieval call binding the contract method 0x7aa63a86.
//
// Solidity: function getTotalElements() view returns(uint256 _totalElements)
func (_OvmCtc *OvmCtcCaller) GetTotalElements(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "getTotalElements")
	return *ret0, err
}

// GetTotalElements is a free data retrieval call binding the contract method 0x7aa63a86.
//
// Solidity: function getTotalElements() view returns(uint256 _totalElements)
func (_OvmCtc *OvmCtcSession) GetTotalElements() (*big.Int, error) {
	return _OvmCtc.Contract.GetTotalElements(&_OvmCtc.CallOpts)
}

// GetTotalElements is a free data retrieval call binding the contract method 0x7aa63a86.
//
// Solidity: function getTotalElements() view returns(uint256 _totalElements)
func (_OvmCtc *OvmCtcCallerSession) GetTotalElements() (*big.Int, error) {
	return _OvmCtc.Contract.GetTotalElements(&_OvmCtc.CallOpts)
}

// L2GasDiscountDivisor is a free data retrieval call binding the contract method 0xccf987c8.
//
// Solidity: function l2GasDiscountDivisor() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) L2GasDiscountDivisor(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "l2GasDiscountDivisor")
	return *ret0, err
}

// L2GasDiscountDivisor is a free data retrieval call binding the contract method 0xccf987c8.
//
// Solidity: function l2GasDiscountDivisor() view returns(uint256)
func (_OvmCtc *OvmCtcSession) L2GasDiscountDivisor() (*big.Int, error) {
	return _OvmCtc.Contract.L2GasDiscountDivisor(&_OvmCtc.CallOpts)
}

// L2GasDiscountDivisor is a free data retrieval call binding the contract method 0xccf987c8.
//
// Solidity: function l2GasDiscountDivisor() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) L2GasDiscountDivisor() (*big.Int, error) {
	return _OvmCtc.Contract.L2GasDiscountDivisor(&_OvmCtc.CallOpts)
}

// LibAddressManager is a free data retrieval call binding the contract method 0x299ca478.
//
// Solidity: function libAddressManager() view returns(address)
func (_OvmCtc *OvmCtcCaller) LibAddressManager(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "libAddressManager")
	return *ret0, err
}

// LibAddressManager is a free data retrieval call binding the contract method 0x299ca478.
//
// Solidity: function libAddressManager() view returns(address)
func (_OvmCtc *OvmCtcSession) LibAddressManager() (common.Address, error) {
	return _OvmCtc.Contract.LibAddressManager(&_OvmCtc.CallOpts)
}

// LibAddressManager is a free data retrieval call binding the contract method 0x299ca478.
//
// Solidity: function libAddressManager() view returns(address)
func (_OvmCtc *OvmCtcCallerSession) LibAddressManager() (common.Address, error) {
	return _OvmCtc.Contract.LibAddressManager(&_OvmCtc.CallOpts)
}

// MaxTransactionGasLimit is a free data retrieval call binding the contract method 0x8d38c6c1.
//
// Solidity: function maxTransactionGasLimit() view returns(uint256)
func (_OvmCtc *OvmCtcCaller) MaxTransactionGasLimit(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "maxTransactionGasLimit")
	return *ret0, err
}

// MaxTransactionGasLimit is a free data retrieval call binding the contract method 0x8d38c6c1.
//
// Solidity: function maxTransactionGasLimit() view returns(uint256)
func (_OvmCtc *OvmCtcSession) MaxTransactionGasLimit() (*big.Int, error) {
	return _OvmCtc.Contract.MaxTransactionGasLimit(&_OvmCtc.CallOpts)
}

// MaxTransactionGasLimit is a free data retrieval call binding the contract method 0x8d38c6c1.
//
// Solidity: function maxTransactionGasLimit() view returns(uint256)
func (_OvmCtc *OvmCtcCallerSession) MaxTransactionGasLimit() (*big.Int, error) {
	return _OvmCtc.Contract.MaxTransactionGasLimit(&_OvmCtc.CallOpts)
}

// Queue is a free data retrieval call binding the contract method 0xe10d29ee.
//
// Solidity: function queue() view returns(address)
func (_OvmCtc *OvmCtcCaller) Queue(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "queue")
	return *ret0, err
}

// Queue is a free data retrieval call binding the contract method 0xe10d29ee.
//
// Solidity: function queue() view returns(address)
func (_OvmCtc *OvmCtcSession) Queue() (common.Address, error) {
	return _OvmCtc.Contract.Queue(&_OvmCtc.CallOpts)
}

// Queue is a free data retrieval call binding the contract method 0xe10d29ee.
//
// Solidity: function queue() view returns(address)
func (_OvmCtc *OvmCtcCallerSession) Queue() (common.Address, error) {
	return _OvmCtc.Contract.Queue(&_OvmCtc.CallOpts)
}

// Resolve is a free data retrieval call binding the contract method 0x461a4478.
//
// Solidity: function resolve(string _name) view returns(address)
func (_OvmCtc *OvmCtcCaller) Resolve(opts *bind.CallOpts, _name string) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _OvmCtc.contract.Call(opts, out, "resolve", _name)
	return *ret0, err
}

// Resolve is a free data retrieval call binding the contract method 0x461a4478.
//
// Solidity: function resolve(string _name) view returns(address)
func (_OvmCtc *OvmCtcSession) Resolve(_name string) (common.Address, error) {
	return _OvmCtc.Contract.Resolve(&_OvmCtc.CallOpts, _name)
}

// Resolve is a free data retrieval call binding the contract method 0x461a4478.
//
// Solidity: function resolve(string _name) view returns(address)
func (_OvmCtc *OvmCtcCallerSession) Resolve(_name string) (common.Address, error) {
	return _OvmCtc.Contract.Resolve(&_OvmCtc.CallOpts, _name)
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
//
// Solidity: function appendSequencerBatch() returns()
func (_OvmCtc *OvmCtcTransactor) AppendSequencerBatch(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _OvmCtc.contract.Transact(opts, "appendSequencerBatch")
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
//
// Solidity: function appendSequencerBatch() returns()
func (_OvmCtc *OvmCtcSession) AppendSequencerBatch() (*types.Transaction, error) {
	return _OvmCtc.Contract.AppendSequencerBatch(&_OvmCtc.TransactOpts)
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
//
// Solidity: function appendSequencerBatch() returns()
func (_OvmCtc *OvmCtcTransactorSession) AppendSequencerBatch() (*types.Transaction, error) {
	return _OvmCtc.Contract.AppendSequencerBatch(&_OvmCtc.TransactOpts)
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
// these three were manually added so that we get an interface to RawTransact
// Solidity: function RawAppendSequencerBatch() returns()
func (_OvmCtc *OvmCtcTransactor) RawAppendSequencerBatch(opts *bind.TransactOpts, calldata []byte) (*types.Transaction, error) {
	return _OvmCtc.contract.RawTransact(opts, calldata)
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
// these three were manually added so that we get an interface to RawTransact
// Solidity: function appendSequencerBatch() returns()
func (_OvmCtc *OvmCtcSession) RawAppendSequencerBatch(calldata []byte) (*types.Transaction, error) {
	return _OvmCtc.Contract.RawAppendSequencerBatch(&_OvmCtc.TransactOpts, calldata)
}

// AppendSequencerBatch is a paid mutator transaction binding the contract method 0xd0f89344.
// these three were manually added so that we get an interface to RawTransact
// Solidity: function appendSequencerBatch() returns()
func (_OvmCtc *OvmCtcTransactorSession) RawAppendSequencerBatch(calldata []byte) (*types.Transaction, error) {
	return _OvmCtc.Contract.RawAppendSequencerBatch(&_OvmCtc.TransactOpts, calldata)
}

// Enqueue is a paid mutator transaction binding the contract method 0x6fee07e0.
//
// Solidity: function enqueue(address _target, uint256 _gasLimit, bytes _data) returns()
func (_OvmCtc *OvmCtcTransactor) Enqueue(opts *bind.TransactOpts, _target common.Address, _gasLimit *big.Int, _data []byte) (*types.Transaction, error) {
	return _OvmCtc.contract.Transact(opts, "enqueue", _target, _gasLimit, _data)
}

// Enqueue is a paid mutator transaction binding the contract method 0x6fee07e0.
//
// Solidity: function enqueue(address _target, uint256 _gasLimit, bytes _data) returns()
func (_OvmCtc *OvmCtcSession) Enqueue(_target common.Address, _gasLimit *big.Int, _data []byte) (*types.Transaction, error) {
	return _OvmCtc.Contract.Enqueue(&_OvmCtc.TransactOpts, _target, _gasLimit, _data)
}

// Enqueue is a paid mutator transaction binding the contract method 0x6fee07e0.
//
// Solidity: function enqueue(address _target, uint256 _gasLimit, bytes _data) returns()
func (_OvmCtc *OvmCtcTransactorSession) Enqueue(_target common.Address, _gasLimit *big.Int, _data []byte) (*types.Transaction, error) {
	return _OvmCtc.Contract.Enqueue(&_OvmCtc.TransactOpts, _target, _gasLimit, _data)
}

// SetGasParams is a paid mutator transaction binding the contract method 0xedcc4a45.
//
// Solidity: function setGasParams(uint256 _l2GasDiscountDivisor, uint256 _enqueueGasCost) returns()
func (_OvmCtc *OvmCtcTransactor) SetGasParams(opts *bind.TransactOpts, _l2GasDiscountDivisor *big.Int, _enqueueGasCost *big.Int) (*types.Transaction, error) {
	return _OvmCtc.contract.Transact(opts, "setGasParams", _l2GasDiscountDivisor, _enqueueGasCost)
}

// SetGasParams is a paid mutator transaction binding the contract method 0xedcc4a45.
//
// Solidity: function setGasParams(uint256 _l2GasDiscountDivisor, uint256 _enqueueGasCost) returns()
func (_OvmCtc *OvmCtcSession) SetGasParams(_l2GasDiscountDivisor *big.Int, _enqueueGasCost *big.Int) (*types.Transaction, error) {
	return _OvmCtc.Contract.SetGasParams(&_OvmCtc.TransactOpts, _l2GasDiscountDivisor, _enqueueGasCost)
}

// SetGasParams is a paid mutator transaction binding the contract method 0xedcc4a45.
//
// Solidity: function setGasParams(uint256 _l2GasDiscountDivisor, uint256 _enqueueGasCost) returns()
func (_OvmCtc *OvmCtcTransactorSession) SetGasParams(_l2GasDiscountDivisor *big.Int, _enqueueGasCost *big.Int) (*types.Transaction, error) {
	return _OvmCtc.Contract.SetGasParams(&_OvmCtc.TransactOpts, _l2GasDiscountDivisor, _enqueueGasCost)
}

// OvmCtcL2GasParamsUpdatedIterator is returned from FilterL2GasParamsUpdated and is used to iterate over the raw logs and unpacked data for L2GasParamsUpdated events raised by the OvmCtc contract.
type OvmCtcL2GasParamsUpdatedIterator struct {
	Event *OvmCtcL2GasParamsUpdated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OvmCtcL2GasParamsUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OvmCtcL2GasParamsUpdated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OvmCtcL2GasParamsUpdated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OvmCtcL2GasParamsUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OvmCtcL2GasParamsUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OvmCtcL2GasParamsUpdated represents a L2GasParamsUpdated event raised by the OvmCtc contract.
type OvmCtcL2GasParamsUpdated struct {
	L2GasDiscountDivisor *big.Int
	EnqueueGasCost       *big.Int
	EnqueueL2GasPrepaid  *big.Int
	Raw                  types.Log // Blockchain specific contextual infos
}

// FilterL2GasParamsUpdated is a free log retrieval operation binding the contract event 0xc6ed75e96b8b18b71edc1a6e82a9d677f8268c774a262c624eeb2cf0a8b3e07e.
//
// Solidity: event L2GasParamsUpdated(uint256 l2GasDiscountDivisor, uint256 enqueueGasCost, uint256 enqueueL2GasPrepaid)
func (_OvmCtc *OvmCtcFilterer) FilterL2GasParamsUpdated(opts *bind.FilterOpts) (*OvmCtcL2GasParamsUpdatedIterator, error) {

	logs, sub, err := _OvmCtc.contract.FilterLogs(opts, "L2GasParamsUpdated")
	if err != nil {
		return nil, err
	}
	return &OvmCtcL2GasParamsUpdatedIterator{contract: _OvmCtc.contract, event: "L2GasParamsUpdated", logs: logs, sub: sub}, nil
}

// WatchL2GasParamsUpdated is a free log subscription operation binding the contract event 0xc6ed75e96b8b18b71edc1a6e82a9d677f8268c774a262c624eeb2cf0a8b3e07e.
//
// Solidity: event L2GasParamsUpdated(uint256 l2GasDiscountDivisor, uint256 enqueueGasCost, uint256 enqueueL2GasPrepaid)
func (_OvmCtc *OvmCtcFilterer) WatchL2GasParamsUpdated(opts *bind.WatchOpts, sink chan<- *OvmCtcL2GasParamsUpdated) (event.Subscription, error) {

	logs, sub, err := _OvmCtc.contract.WatchLogs(opts, "L2GasParamsUpdated")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OvmCtcL2GasParamsUpdated)
				if err := _OvmCtc.contract.UnpackLog(event, "L2GasParamsUpdated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseL2GasParamsUpdated is a log parse operation binding the contract event 0xc6ed75e96b8b18b71edc1a6e82a9d677f8268c774a262c624eeb2cf0a8b3e07e.
//
// Solidity: event L2GasParamsUpdated(uint256 l2GasDiscountDivisor, uint256 enqueueGasCost, uint256 enqueueL2GasPrepaid)
func (_OvmCtc *OvmCtcFilterer) ParseL2GasParamsUpdated(log types.Log) (*OvmCtcL2GasParamsUpdated, error) {
	event := new(OvmCtcL2GasParamsUpdated)
	if err := _OvmCtc.contract.UnpackLog(event, "L2GasParamsUpdated", log); err != nil {
		return nil, err
	}
	return event, nil
}

// OvmCtcQueueBatchAppendedIterator is returned from FilterQueueBatchAppended and is used to iterate over the raw logs and unpacked data for QueueBatchAppended events raised by the OvmCtc contract.
type OvmCtcQueueBatchAppendedIterator struct {
	Event *OvmCtcQueueBatchAppended // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OvmCtcQueueBatchAppendedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OvmCtcQueueBatchAppended)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OvmCtcQueueBatchAppended)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OvmCtcQueueBatchAppendedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OvmCtcQueueBatchAppendedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OvmCtcQueueBatchAppended represents a QueueBatchAppended event raised by the OvmCtc contract.
type OvmCtcQueueBatchAppended struct {
	StartingQueueIndex *big.Int
	NumQueueElements   *big.Int
	TotalElements      *big.Int
	Raw                types.Log // Blockchain specific contextual infos
}

// FilterQueueBatchAppended is a free log retrieval operation binding the contract event 0x64d7f508348c70dea42d5302a393987e4abc20e45954ab3f9d320207751956f0.
//
// Solidity: event QueueBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) FilterQueueBatchAppended(opts *bind.FilterOpts) (*OvmCtcQueueBatchAppendedIterator, error) {

	logs, sub, err := _OvmCtc.contract.FilterLogs(opts, "QueueBatchAppended")
	if err != nil {
		return nil, err
	}
	return &OvmCtcQueueBatchAppendedIterator{contract: _OvmCtc.contract, event: "QueueBatchAppended", logs: logs, sub: sub}, nil
}

// WatchQueueBatchAppended is a free log subscription operation binding the contract event 0x64d7f508348c70dea42d5302a393987e4abc20e45954ab3f9d320207751956f0.
//
// Solidity: event QueueBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) WatchQueueBatchAppended(opts *bind.WatchOpts, sink chan<- *OvmCtcQueueBatchAppended) (event.Subscription, error) {

	logs, sub, err := _OvmCtc.contract.WatchLogs(opts, "QueueBatchAppended")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OvmCtcQueueBatchAppended)
				if err := _OvmCtc.contract.UnpackLog(event, "QueueBatchAppended", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseQueueBatchAppended is a log parse operation binding the contract event 0x64d7f508348c70dea42d5302a393987e4abc20e45954ab3f9d320207751956f0.
//
// Solidity: event QueueBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) ParseQueueBatchAppended(log types.Log) (*OvmCtcQueueBatchAppended, error) {
	event := new(OvmCtcQueueBatchAppended)
	if err := _OvmCtc.contract.UnpackLog(event, "QueueBatchAppended", log); err != nil {
		return nil, err
	}
	return event, nil
}

// OvmCtcSequencerBatchAppendedIterator is returned from FilterSequencerBatchAppended and is used to iterate over the raw logs and unpacked data for SequencerBatchAppended events raised by the OvmCtc contract.
type OvmCtcSequencerBatchAppendedIterator struct {
	Event *OvmCtcSequencerBatchAppended // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OvmCtcSequencerBatchAppendedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OvmCtcSequencerBatchAppended)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OvmCtcSequencerBatchAppended)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OvmCtcSequencerBatchAppendedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OvmCtcSequencerBatchAppendedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OvmCtcSequencerBatchAppended represents a SequencerBatchAppended event raised by the OvmCtc contract.
type OvmCtcSequencerBatchAppended struct {
	StartingQueueIndex *big.Int
	NumQueueElements   *big.Int
	TotalElements      *big.Int
	Raw                types.Log // Blockchain specific contextual infos
}

// FilterSequencerBatchAppended is a free log retrieval operation binding the contract event 0x602f1aeac0ca2e7a13e281a9ef0ad7838542712ce16780fa2ecffd351f05f899.
//
// Solidity: event SequencerBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) FilterSequencerBatchAppended(opts *bind.FilterOpts) (*OvmCtcSequencerBatchAppendedIterator, error) {

	logs, sub, err := _OvmCtc.contract.FilterLogs(opts, "SequencerBatchAppended")
	if err != nil {
		return nil, err
	}
	return &OvmCtcSequencerBatchAppendedIterator{contract: _OvmCtc.contract, event: "SequencerBatchAppended", logs: logs, sub: sub}, nil
}

// WatchSequencerBatchAppended is a free log subscription operation binding the contract event 0x602f1aeac0ca2e7a13e281a9ef0ad7838542712ce16780fa2ecffd351f05f899.
//
// Solidity: event SequencerBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) WatchSequencerBatchAppended(opts *bind.WatchOpts, sink chan<- *OvmCtcSequencerBatchAppended) (event.Subscription, error) {

	logs, sub, err := _OvmCtc.contract.WatchLogs(opts, "SequencerBatchAppended")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OvmCtcSequencerBatchAppended)
				if err := _OvmCtc.contract.UnpackLog(event, "SequencerBatchAppended", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseSequencerBatchAppended is a log parse operation binding the contract event 0x602f1aeac0ca2e7a13e281a9ef0ad7838542712ce16780fa2ecffd351f05f899.
//
// Solidity: event SequencerBatchAppended(uint256 _startingQueueIndex, uint256 _numQueueElements, uint256 _totalElements)
func (_OvmCtc *OvmCtcFilterer) ParseSequencerBatchAppended(log types.Log) (*OvmCtcSequencerBatchAppended, error) {
	event := new(OvmCtcSequencerBatchAppended)
	if err := _OvmCtc.contract.UnpackLog(event, "SequencerBatchAppended", log); err != nil {
		return nil, err
	}
	return event, nil
}

// OvmCtcTransactionBatchAppendedIterator is returned from FilterTransactionBatchAppended and is used to iterate over the raw logs and unpacked data for TransactionBatchAppended events raised by the OvmCtc contract.
type OvmCtcTransactionBatchAppendedIterator struct {
	Event *OvmCtcTransactionBatchAppended // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OvmCtcTransactionBatchAppendedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OvmCtcTransactionBatchAppended)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OvmCtcTransactionBatchAppended)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OvmCtcTransactionBatchAppendedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OvmCtcTransactionBatchAppendedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OvmCtcTransactionBatchAppended represents a TransactionBatchAppended event raised by the OvmCtc contract.
type OvmCtcTransactionBatchAppended struct {
	BatchIndex        *big.Int
	BatchRoot         [32]byte
	BatchSize         *big.Int
	PrevTotalElements *big.Int
	ExtraData         []byte
	Raw               types.Log // Blockchain specific contextual infos
}

// FilterTransactionBatchAppended is a free log retrieval operation binding the contract event 0x127186556e7be68c7e31263195225b4de02820707889540969f62c05cf73525e.
//
// Solidity: event TransactionBatchAppended(uint256 indexed _batchIndex, bytes32 _batchRoot, uint256 _batchSize, uint256 _prevTotalElements, bytes _extraData)
func (_OvmCtc *OvmCtcFilterer) FilterTransactionBatchAppended(opts *bind.FilterOpts, _batchIndex []*big.Int) (*OvmCtcTransactionBatchAppendedIterator, error) {

	var _batchIndexRule []interface{}
	for _, _batchIndexItem := range _batchIndex {
		_batchIndexRule = append(_batchIndexRule, _batchIndexItem)
	}

	logs, sub, err := _OvmCtc.contract.FilterLogs(opts, "TransactionBatchAppended", _batchIndexRule)
	if err != nil {
		return nil, err
	}
	return &OvmCtcTransactionBatchAppendedIterator{contract: _OvmCtc.contract, event: "TransactionBatchAppended", logs: logs, sub: sub}, nil
}

// WatchTransactionBatchAppended is a free log subscription operation binding the contract event 0x127186556e7be68c7e31263195225b4de02820707889540969f62c05cf73525e.
//
// Solidity: event TransactionBatchAppended(uint256 indexed _batchIndex, bytes32 _batchRoot, uint256 _batchSize, uint256 _prevTotalElements, bytes _extraData)
func (_OvmCtc *OvmCtcFilterer) WatchTransactionBatchAppended(opts *bind.WatchOpts, sink chan<- *OvmCtcTransactionBatchAppended, _batchIndex []*big.Int) (event.Subscription, error) {

	var _batchIndexRule []interface{}
	for _, _batchIndexItem := range _batchIndex {
		_batchIndexRule = append(_batchIndexRule, _batchIndexItem)
	}

	logs, sub, err := _OvmCtc.contract.WatchLogs(opts, "TransactionBatchAppended", _batchIndexRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OvmCtcTransactionBatchAppended)
				if err := _OvmCtc.contract.UnpackLog(event, "TransactionBatchAppended", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransactionBatchAppended is a log parse operation binding the contract event 0x127186556e7be68c7e31263195225b4de02820707889540969f62c05cf73525e.
//
// Solidity: event TransactionBatchAppended(uint256 indexed _batchIndex, bytes32 _batchRoot, uint256 _batchSize, uint256 _prevTotalElements, bytes _extraData)
func (_OvmCtc *OvmCtcFilterer) ParseTransactionBatchAppended(log types.Log) (*OvmCtcTransactionBatchAppended, error) {
	event := new(OvmCtcTransactionBatchAppended)
	if err := _OvmCtc.contract.UnpackLog(event, "TransactionBatchAppended", log); err != nil {
		return nil, err
	}
	return event, nil
}

// OvmCtcTransactionEnqueuedIterator is returned from FilterTransactionEnqueued and is used to iterate over the raw logs and unpacked data for TransactionEnqueued events raised by the OvmCtc contract.
type OvmCtcTransactionEnqueuedIterator struct {
	Event *OvmCtcTransactionEnqueued // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *OvmCtcTransactionEnqueuedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(OvmCtcTransactionEnqueued)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(OvmCtcTransactionEnqueued)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *OvmCtcTransactionEnqueuedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *OvmCtcTransactionEnqueuedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// OvmCtcTransactionEnqueued represents a TransactionEnqueued event raised by the OvmCtc contract.
type OvmCtcTransactionEnqueued struct {
	L1TxOrigin common.Address
	Target     common.Address
	GasLimit   *big.Int
	Data       []byte
	QueueIndex *big.Int
	Timestamp  *big.Int
	Raw        types.Log // Blockchain specific contextual infos
}

// FilterTransactionEnqueued is a free log retrieval operation binding the contract event 0x4b388aecf9fa6cc92253704e5975a6129a4f735bdbd99567df4ed0094ee4ceb5.
//
// Solidity: event TransactionEnqueued(address indexed _l1TxOrigin, address indexed _target, uint256 _gasLimit, bytes _data, uint256 indexed _queueIndex, uint256 _timestamp)
func (_OvmCtc *OvmCtcFilterer) FilterTransactionEnqueued(opts *bind.FilterOpts, _l1TxOrigin []common.Address, _target []common.Address, _queueIndex []*big.Int) (*OvmCtcTransactionEnqueuedIterator, error) {

	var _l1TxOriginRule []interface{}
	for _, _l1TxOriginItem := range _l1TxOrigin {
		_l1TxOriginRule = append(_l1TxOriginRule, _l1TxOriginItem)
	}
	var _targetRule []interface{}
	for _, _targetItem := range _target {
		_targetRule = append(_targetRule, _targetItem)
	}

	var _queueIndexRule []interface{}
	for _, _queueIndexItem := range _queueIndex {
		_queueIndexRule = append(_queueIndexRule, _queueIndexItem)
	}

	logs, sub, err := _OvmCtc.contract.FilterLogs(opts, "TransactionEnqueued", _l1TxOriginRule, _targetRule, _queueIndexRule)
	if err != nil {
		return nil, err
	}
	return &OvmCtcTransactionEnqueuedIterator{contract: _OvmCtc.contract, event: "TransactionEnqueued", logs: logs, sub: sub}, nil
}

// WatchTransactionEnqueued is a free log subscription operation binding the contract event 0x4b388aecf9fa6cc92253704e5975a6129a4f735bdbd99567df4ed0094ee4ceb5.
//
// Solidity: event TransactionEnqueued(address indexed _l1TxOrigin, address indexed _target, uint256 _gasLimit, bytes _data, uint256 indexed _queueIndex, uint256 _timestamp)
func (_OvmCtc *OvmCtcFilterer) WatchTransactionEnqueued(opts *bind.WatchOpts, sink chan<- *OvmCtcTransactionEnqueued, _l1TxOrigin []common.Address, _target []common.Address, _queueIndex []*big.Int) (event.Subscription, error) {

	var _l1TxOriginRule []interface{}
	for _, _l1TxOriginItem := range _l1TxOrigin {
		_l1TxOriginRule = append(_l1TxOriginRule, _l1TxOriginItem)
	}
	var _targetRule []interface{}
	for _, _targetItem := range _target {
		_targetRule = append(_targetRule, _targetItem)
	}

	var _queueIndexRule []interface{}
	for _, _queueIndexItem := range _queueIndex {
		_queueIndexRule = append(_queueIndexRule, _queueIndexItem)
	}

	logs, sub, err := _OvmCtc.contract.WatchLogs(opts, "TransactionEnqueued", _l1TxOriginRule, _targetRule, _queueIndexRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(OvmCtcTransactionEnqueued)
				if err := _OvmCtc.contract.UnpackLog(event, "TransactionEnqueued", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransactionEnqueued is a log parse operation binding the contract event 0x4b388aecf9fa6cc92253704e5975a6129a4f735bdbd99567df4ed0094ee4ceb5.
//
// Solidity: event TransactionEnqueued(address indexed _l1TxOrigin, address indexed _target, uint256 _gasLimit, bytes _data, uint256 indexed _queueIndex, uint256 _timestamp)
func (_OvmCtc *OvmCtcFilterer) ParseTransactionEnqueued(log types.Log) (*OvmCtcTransactionEnqueued, error) {
	event := new(OvmCtcTransactionEnqueued)
	if err := _OvmCtc.contract.UnpackLog(event, "TransactionEnqueued", log); err != nil {
		return nil, err
	}
	return event, nil
}
