const mockedTx = {
  credit: {
    getAccount() {
      return 0;
    }
  },
  getCreditsList() {
    return [this.credit];
  },
  getDebitsList() {
    return [this.debit];
  },
  debit: {
    getPreviousAccount() {
      return 0;
    }
  }
};

// prettier-ignore
export const mockedSingleTransaction = {
  amount: -93700,
  blockHash: new Uint8Array([176, 30, 92, 96, 245, 4, 4, 60, 189, 34, 191, 224, 199, 34, 210, 254, 56, 15, 213, 59, 149, 93, 113, 107, 212, 119, 170, 120, 188, 173, 135, 1]),
  creditAddresses: [
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22u5ZUnwTGBwkZwy4c6Sv6fjPZs1ofE3c6si",
    "22toWN6kKSt2KzbARjYE28CdxFPvqfF87XXe"
  ],
  creditsAmount: 2660550005,
  debitAccounts: [0],
  debitsAmount: 2660643705,
  direction: "transfer",
  fee: 93700,
  hash: new Uint8Array([9, 107, 8, 120, 206, 34, 113, 182, 106, 168, 145, 251, 138, 140, 180, 172, 4, 233, 75, 104, 3, 218, 159, 97, 118, 173, 81, 179, 153, 247, 2, 32]),
  height: 642,
  index: 16,
  timestamp: 1529480697,
  tx: mockedTx,
  txHash: "2002f799b351ad76619fda03684be904acb48c8afb91a86ab67122ce78086b09",
  txType: "Regular",
  type: 0
};

// prettier-ignore
export const unminedMockedTransactions = [
  {
    amount: 230913783,
    blockHash: null,
    creditAddresses: ["22trunbF1DXEN5vPtKsfaWHZkd6UwhZUZP2Y"],
    creditsAmount: 230913783,
    debitAccounts: [0, 0],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([54, 17, 28, 4, 238, 119, 219, 68, 111, 119, 75, 239, 139, 11, 87, 138, 125, 181, 170, 2, 162, 208, 225, 100, 73, 67, 110, 197, 218, 47, 207, 238]),
    height: -1,
    index: 0,
    timestamp: null,
    tx: mockedTx,
    txHash: "eecf2fdac56e434964e1d0a202aab57d8a570b8bef4b776f44db77ee041c1136",
    txType: "Vote",
    type: 2
  },
  {
    amount: -20055000,
    blockHash: null,
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([56, 36, 204, 220, 77, 2, 255, 3, 86, 142, 69, 231, 173, 114, 44, 158, 126, 217, 227, 49, 58, 7, 49, 142, 47, 86, 141, 62, 249, 135, 62, 59]),
    height: -1,
    index: 1,
    timestamp: null,
    tx: mockedTx,
    txHash: "3b3e87f93e8d562f8e31073a31e3d97e9e2c72ade7458e5603ff024ddccc2438",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -57700,
    blockHash: null,
    creditAddresses: ["22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22u36W2PeJmRmW9wnRzZMxrhFXYzzNkuepT1", "22tufHk5JaX3LtVAAA592vNPgi7KbaynEkP8"],
    creditsAmount: 230856083,
    debitAccounts: [0],
    debitsAmount: 230913783,
    direction: "transfer",
    fee: 57700,
    hash: new Uint8Array([111, 95, 195, 71, 110, 8, 102, 109, 148, 231, 251, 124, 142, 116, 163, 3, 6, 66, 94, 27, 122, 2, 54, 130, 112, 244, 186, 89, 198, 34, 183, 79]),
    height: -1,
    index: 2,
    timestamp: null,
    tx: mockedTx,
    txHash: "4fb722c659baf4708236027a1b5e420603a3748e7cfbe7946d66086e47c35f6f",
    txType: "Regular",
    type: 0
  }
];

// prettier-ignore
export const mockedTransactions = [
  {
    amount: 230913783,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22u7rYK4NWzGRJkJzCthbo37mN7CKCNZJXA1"],
    creditsAmount: 230913783,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([182, 125, 33, 17, 166, 175, 165, 84, 251, 164, 242, 69, 113, 15, 208, 81, 52, 238, 137, 12, 138, 178, 227, 13, 36, 209, 52, 239, 164, 211, 162]),
    height: 641,
    index: 0,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "a2d3a4ef34d1240de3b28a0c89ee3451d00f7145f2a4fb54a5afa611217d0cb6",
    txType: "Vote",
    type: 2
  },
  {
    amount: 230913783,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22u7jtCJiN6HeyZDm3xMBpCjKwgEnq3VxPAB"],
    creditsAmount: 230913783,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([241, 216, 42, 168, 253, 205, 193, 186, 215, 112, 155, 41, 211, 224, 63, 204, 197, 92, 119, 1, 14, 225, 171, 32, 152, 133, 102, 143, 16, 247, 68, 228]),
    height: 641,
    index: 1,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "e444f7108f66859820abe10e01775cc5cc3fe0d3299b70d7bac1cdfda82ad8f1",
    txType: "Vote",
    type: 2
  },
  {
    amount: 230913783,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22u7jtCJiN6HeyZDm3xMBpCjKwgEnq3VxPAB"],
    creditsAmount: 230913783,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([6, 121, 151, 69, 36, 158, 41, 235, 223, 197, 54, 188, 44, 188, 110, 106, 54, 192, 44, 19, 173, 3, 250, 47, 222, 18, 230, 36, 235, 187, 177, 235]),
    height: 641,
    index: 2,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "ebb1bbeb24e612de2ffa03ad132cc0366a6ebc2cbc36c5dfeb299e2445977906",
    txType: "Vote",
    type: 2
  },
  {
    amount: 230913783,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22u7jtCJiN6HeyZDm3xMBpCjKwgEnq3VxPAB"],
    creditsAmount: 230913783,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([36, 63, 51, 136, 162, 170, 144, 204, 33, 188, 98, 160, 181, 26, 140, 125, 64, 191, 106, 143, 201, 212, 93, 207, 139, 205, 247, 234, 166, 239, 173, 107]),
    height: 641,
    index: 3,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "6badefa6eaf7cd8bcf5dd4c98f6abf407d8c1ab5a062bc21cc90aaa288333f24",
    txType: "Vote",
    type: 2
  },

  {
    amount: 230913783,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22trCmX2K59fTwV9pLppDjm9EPrXuLqVVBpy"],
    creditsAmount: 230913783,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([28, 61, 200, 168, 226, 41, 91, 208, 78, 8, 68, 123, 223, 177, 234, 61, 221, 77, 237, 151, 226, 64, 186, 239, 92, 180, 105, 239, 61, 92, 133, 73]),
    height: 641,
    index: 4,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "49855c3def69b45cefba40e297ed4ddd3deab1df7b44084ed05b29e2a8c83d1c",
    txType: "Vote",
    type: 2
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([250, 150, 160, 251, 135, 156, 171, 49, 97, 178, 210, 136, 56, 29, 167, 137, 175, 222, 209, 232, 251, 120, 215, 4, 188, 64, 165, 68, 66, 216, 175, 254]),
    height: 641,
    index: 5,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "feafd84244a540bc04d778fbe8d1deaf89a71d3888d2b26131ab9c87fba096fa",
    txType: "Ticket",
    type: 1
  },

  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([8, 45, 219, 213, 10, 163, 205, 22, 1, 29, 107, 3, 112, 205, 102, 211, 130, 87, 51, 70, 123, 92, 160, 73, 176, 252, 180, 67, 70, 129, 56, 234]),
    height: 641,
    index: 6,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "ea38814643b4fcb049a05c7b46335782d366cd70036b1d0116cda30ad5db2d08",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([93, 238, 178, 160, 5, 8, 63, 107, 184, 96, 122, 140, 43, 2, 162, 204, 230, 136, 142, 20, 65, 145, 158, 158, 223, 68, 54, 100, 206, 39, 149, 78]),
    height: 641,
    index: 7,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "4e9527ce643644df9e9e9141148e88e6cca2022b8c7a60b86b3f0805a0b2ee5d",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([24, 156, 55, 185, 27, 50, 215, 171, 148, 39, 69, 18, 87, 222, 135, 151, 165, 41, 87, 29, 39, 227, 30, 202, 83, 250, 97, 142, 255, 139, 33, 211]),
    height: 641,
    index: 8,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "d3218bff8e61fa53ca1ee3271d5729a59787de5712452794abd7321bb9379c18",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([240, 126, 181, 98, 244, 93, 57, 35, 231, 105, 251, 168, 58, 238, 253, 133, 67, 18, 57, 203, 89, 210, 192, 72, 123, 91, 107, 31, 123, 93, 36, 179]),
    height: 641,
    index: 9,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "b3245d7b1f6b5b7b48c0d259cb39124385fdee3aa8fb69e723395df462b57ef0",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([26, 204, 18, 152, 166, 236, 17, 170, 155, 245, 178, 152, 192, 162, 110, 14, 49, 182, 207, 58, 39, 20, 66, 72, 199, 213, 164, 75, 172, 66, 99, 94]),
    height: 641,
    index: 10,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "5e6342ac4ba4d5c7484214273acfb6310e6ea2c098b2f59baa11eca69812cc1a",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([102, 121, 139, 2, 20, 44, 222, 252, 235, 143, 155, 174, 201, 50, 145, 176, 33, 35, 45, 121, 242, 221, 69, 250, 163, 88, 107, 59, 106, 139, 51, 232]),
    height: 641,
    index: 11,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "e8338b6a3b6b58a3fa45ddf2792d2321b09132c9ae9b8febfcde2c14028b7966",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([162, 73, 235, 4, 80, 183, 170, 129, 4, 181, 44, 170, 168, 238, 106, 255, 4, 254, 245, 80, 65, 233, 164, 159, 163, 209, 178, 139, 200, 249, 139, 7]),
    height: 641,
    index: 12,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "078bf9c88bb2d1a39fa4e94150f5fe04ff6aeea8aa2cb50481aab75004eb49a2",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([197, 158, 70, 39, 12, 167, 21, 120, 87, 228, 143, 220, 205, 99, 13, 190, 187, 216, 230, 226, 88, 121, 241, 93, 150, 25, 122, 77, 130, 6, 168, 88]),
    height: 641,
    index: 13,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "58a806824d7a19965df17958e2e6d8bbbe0d63cddc8fe4577815a70c27469ec5",
    txType: "Ticket",
    type: 1
  },
  {
    amount: -20055000,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [],
    creditsAmount: 0,
    debitAccounts: [0, 0],
    debitsAmount: 20055000,
    direction: "",
    fee: 55000,
    hash: new Uint8Array([74, 137, 143, 152, 0, 10, 8, 253, 42, 83, 52, 136, 1, 89, 80, 25, 0, 219, 248, 154, 10, 95, 37, 56, 5, 74, 102, 184, 30, 153, 88, 107]),
    height: 641,
    index: 14,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "6b58991eb8664a0538255f0a9af8db00195059018834532afd080a00988f894a",
    txType: "Ticket",
    type: 1
  },

  {
    amount: 2660643705,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: ["22tv7nd31sMmD8BpcVRJAWQLqYCjaCuqpWpz"],
    creditsAmount: 2660643705,
    debitAccounts: [],
    debitsAmount: 0,
    direction: "",
    fee: 0,
    hash: new Uint8Array([232, 163, 239, 49, 246, 155, 148, 47, 239, 47, 29, 197, 89, 173, 76, 222, 32, 69, 230, 12, 138, 59, 165, 81, 40, 10, 216, 94, 106, 94, 255, 24]),
    height: 641,
    index: 15,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "18ff5e6a5ed80a2851a53b8a0ce64520de4cad59c51d2fef2f949bf631efa3e8",
    txType: "Coinbase",
    type: 4
  },
  {
    amount: -93700,
    blockHash: new Uint8Array([ 56, 51, 240, 177, 188, 6, 33, 23, 251, 52, 27, 141, 137, 18, 223, 68, 1, 13, 229, 11, 90, 16, 184, 63, 151, 173, 191, 205, 37, 59, 80, 0]),
    creditAddresses: [
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22tuKNXxrosq7YpMkYVU4RQ4vYXgyReBwGTo",
      "22u58ndt3CoUPWSCyabSToqa2HEycrSqSr4B"
    ],
    creditsAmount: 230820083,
    debitAccounts: [0],
    debitsAmount: 230913783,
    direction: "transfer",
    fee: 93700,
    hash: new Uint8Array([68, 148, 51, 117, 91, 109, 252, 117, 50, 145, 36, 154, 95, 94, 241, 243, 48, 194, 63, 159, 249, 135, 202, 232, 23, 127, 29, 184, 2, 75, 225, 189]),
    height: 641,
    index: 16,
    timestamp: 1529480613,
    tx: mockedTx,
    txHash: "bde14b02b81d7f17e8ca87f99f3fc230f3f15e5f9a24913275fc6d5b75339444",
    txType: "Regular",
    type: 0
  }
];
