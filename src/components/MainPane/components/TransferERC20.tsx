import { type FC, useState, useEffect, type ChangeEvent } from "react";

import {
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  VStack,
} from "@chakra-ui/react";
import { erc20Abi, isAddress, parseUnits, type Address } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { AddressInput } from "@/components";
import { useNotify } from "@/hooks";

type Token = {
  id: string;
  symbol: string;
  decimals: number;
  logo: string;
};

const TransferERC20: FC = () => {
  const [amount, setAmount] = useState<string>("0");
  const [receiver, setReceiver] = useState<string>("");
  const [token, setToken] = useState<Token>();

  const { data, error, isPending, isError, writeContract } = useWriteContract();
  const { data: receipt, isLoading } = useWaitForTransactionReceipt({ hash: data });
  const { notifyError, notifySuccess } = useNotify();

  const tokens: Token[] = [
    {
      id: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      decimals: 6,
      logo: "",
    },
    {
      id: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4",
      symbol: "EURC",
      decimals: 6,
      logo: "",
    },
  ];

  const handleTokenChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;

    const currentToken = tokens.filter((token) => token.id === value);
    setToken(currentToken[0]);
  };

  const handleAmountChange = (valueAsString: string): void => {
    setAmount(valueAsString);
  };

  const handleTransfer = () => {
    if (receiver.length === 0 || !isAddress(receiver)) {
      return notifyError({
        title: "Error:",
        message: "The receiver address is not set!",
      });
    }

    if (!token?.id) {
      return notifyError({
        title: "Error:",
        message: "Token not selected.",
      });
    }

    if (parseFloat(amount) <= 0) {
      return notifyError({
        title: "Error:",
        message: "The amount to send must be greater than 0.",
      });
    }

    writeContract({
      abi: erc20Abi,
      address: token.id as Address,
      functionName: "transfer",
      args: [receiver, parseUnits(amount, 6)],
    });
  };

  useEffect(() => {
    if (receipt) {
      notifySuccess({
        title: "Transfer successfully sent!",
        message: `Hash: ${receipt.transactionHash}`,
      });
      setAmount("0");
      setReceiver("");
    }

    if (isError && error) {
      notifyError({
        title: "An error occured:",
        message: error.message,
      });
    }
  }, [receipt, isError, error, notifyError, notifySuccess]);

  return (
    <VStack w={"95%"} minWidth={"270px"} gap={2}>
      <AddressInput receiver={receiver} setReceiver={setReceiver} />

      <Select placeholder="Select Token" isRequired onChange={handleTokenChange}>
        {tokens.map((token) => (
          <option key={token.id} value={token.id}>
            {token.symbol}
          </option>
        ))}
      </Select>

      <HStack w={"100%"}>
        <NumberInput
          min={0}
          step={1}
          precision={18}
          value={amount}
          onChange={handleAmountChange}
          flexGrow={1}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        <Button
          variant="ghost"
          onClick={handleTransfer}
          isLoading={isLoading || isPending}
          className="custom-button"
        >
          Transfer
        </Button>
      </HStack>
    </VStack>
  );
};

export default TransferERC20;
