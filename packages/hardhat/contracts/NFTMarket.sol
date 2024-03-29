// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsForSale;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        string name;
        string description;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool forSale;
    }

    event MarketItemCreated(
        string name,
        string description,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool forSale
    );

    constructor() ERC721("Foamies", "FOAM") {
        owner = payable(msg.sender);
    }

    function updateListingPrice(uint _listingPrice) public {
      require(owner == msg.sender, "Only owner can update listing price.");
      listingPrice = _listingPrice;
    }

    function createToken(
        string memory name,
        string memory description,
        string memory tokenURI, 
        uint256 price
    ) public payable returns (uint) {
        require(
            msg.value == listingPrice,
            "Missing listing price."
        );
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(name, description, newTokenId, price);
        return newTokenId;
    }

    // Create Market Item
    function createMarketItem(
        string memory name,
        string memory description,
        uint256 tokenId,
        uint256 price
    ) private {
        idToMarketItem[tokenId] = MarketItem(
            name,
            description,
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
        _itemsForSale.increment();

        emit MarketItemCreated(
            name,
            description,
            tokenId,
            msg.sender,
            address(this),
            price,
            true
        );
    }

    function createMarketSale(uint256 tokenId)
        public
        payable
    {
        require(
            idToMarketItem[tokenId].tokenId != 0,
            "TokenId does not exist."
        );
        require(
            idToMarketItem[tokenId].forSale == true,
            "TokenId is not for sale."
        );
        require(
            msg.sender != idToMarketItem[tokenId].seller,
            "Cannot purchase own NFT."
        );
        require(
            msg.value == idToMarketItem[tokenId].price,
            "Wrong sale amount provided."
        );
        address seller = idToMarketItem[tokenId].seller;

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].forSale = false;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsForSale.decrement();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    function cancelMarketSale(uint256 tokenId) public {
        require(
            idToMarketItem[tokenId].tokenId != 0,
            "TokenId does not exist."
        );
        require(
            idToMarketItem[tokenId].seller == msg.sender,
            "Only seller can cancel."
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].forSale = false;
        idToMarketItem[tokenId].seller = payable(address(0));
    }

    function resell(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].tokenId != 0,
            "TokenId does not exist."
        );
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only owner can resell."
        );
        require(
            idToMarketItem[tokenId].forSale == false,
            "Item already for sale."
        );
        require(
            msg.value == listingPrice,
            "Missing listing price."
        );

        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].forSale = true;
    }

    function updatePrice(uint256 tokenId, uint256 price) public {
        require(
            idToMarketItem[tokenId].tokenId != 0,
            "TokenId does not exist."
        );
        require(
            idToMarketItem[tokenId].seller == msg.sender,
            "Only seller can update price."
        );
        idToMarketItem[tokenId].price = price;
    }

    // READ ONLY
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        MarketItem[] memory items = new MarketItem[](_tokenIds.current());
        for (uint i = 0; i < _tokenIds.current(); i++) {
            items[i] = idToMarketItem[i + 1];
        }
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender || idToMarketItem[i].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender || idToMarketItem[i].seller == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }
}
